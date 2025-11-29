/**
 * Remove JSON comments (both // and /* style) from text
 * This is a simplified approach that works for most cases
 * Note: For complex JSON with URLs, we skip comment stripping if it would break the JSON
 */
function stripComments(text) {
	// First, try parsing without stripping - most JSON doesn't have comments
	try {
		JSON.parse(text);
		// If it parses successfully, don't strip comments (might contain URLs like https://)
		return text;
	} catch (e) {
		// Only strip comments if parsing failed
		// This regex only matches // at the start of a line (after whitespace) to avoid matching URLs
		let cleaned = text.replace(/^\s*\/\/.*$/gm, '');

		// Remove multi-line comments (/* comment */)
		cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');

		return cleaned;
	}
}

/**
 * Auto-detect log format from input text
 * @param {string} text - Input log text
 * @returns {string} - Detected format: 'json', 'apache', 'nginx', 'kubernetes', 'plain'
 */
export function detectLogFormat(text) {
	if (!text || text.trim().length === 0) {
		return 'plain';
	}

	const lines = text.trim().split('\n');
	const firstLine = lines[0].trim();

	// Skip comment lines when detecting format
	const nonCommentLines = lines.filter(line => {
		const trimmed = line.trim();
		return !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*');
	});

	if (nonCommentLines.length === 0) {
		return 'plain';
	}

	const firstNonCommentLine = nonCommentLines[0].trim();

	// Check for JSON (array or objects)
	// Try to parse the entire text as JSON first
	try {
		const cleaned = stripComments(text.trim());
		// Try to parse without sanitization first (most JSON is valid as-is)
		JSON.parse(cleaned);
		console.log('✅ Detected as JSON (valid parse)');
		return 'json';
	} catch (jsonError) {
		console.log('⚠️ JSON parse failed:', jsonError.message);
		// If full parse fails, check if it's JSON Lines (one JSON object per line)
		if (firstNonCommentLine.startsWith('{') || firstNonCommentLine.startsWith('[')) {
			const jsonLineCount = nonCommentLines.slice(0, Math.min(10, nonCommentLines.length)).filter((line) => {
				try {
					const trimmed = line.trim();
					if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
						const cleaned = stripComments(trimmed);
						JSON.parse(cleaned);
						return true;
					}
				} catch {
					return false;
				}
				return false;
			}).length;

			if (jsonLineCount >= Math.min(3, nonCommentLines.length)) {
				return 'json';
			}
		}
	}

	// Check for Kubernetes describe output
	// Typical patterns: "Name:", "Namespace:", "Labels:", "Annotations:", "Status:", "Events:"
	// Must have actual kubernetes keywords, not just any indented key:value
	const k8sPatterns = /^(Name|Namespace|Labels|Annotations|Status|Events|Conditions|Spec|Metadata|Containers|Volumes|Node|Image|Port|Ready|Restart Count):/i;
	const k8sMatchCount = lines
		.slice(0, Math.min(20, lines.length))
		.filter((line) => k8sPatterns.test(line)).length;

	// Require at least 3 kubernetes-specific keywords to avoid false positives
	if (k8sMatchCount >= 3) {
		return 'kubernetes';
	}

	// Check for Apache/Nginx logs
	// Common Log Format: IP - - [timestamp] "METHOD /path HTTP/1.1" status size
	const apachePattern =
		/^\S+\s+-\s+-\s+\[\d{2}\/\w{3}\/\d{4}:\d{2}:\d{2}:\d{2}\s+[+-]\d{4}\]\s+"[^"]*"\s+\d{3}\s+\d+/;
	// Nginx pattern with additional fields
	const nginxPattern =
		/^\S+\s+-\s+\S+\s+\[\d{2}\/\w{3}\/\d{4}:\d{2}:\d{2}:\d{2}\s+[+-]\d{4}\]\s+"[^"]*"\s+\d{3}\s+\d+/;

	const webLogCount = lines
		.slice(0, Math.min(10, lines.length))
		.filter((line) => apachePattern.test(line) || nginxPattern.test(line)).length;

	if (webLogCount >= Math.min(2, lines.length)) {
		return 'apache';
	}

	// Default to plain text
	console.log('📝 Detected as plain text (default fallback)');
	return 'plain';
}
