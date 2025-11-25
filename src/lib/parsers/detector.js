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

	// Check for JSON (array or objects)
	if (firstLine.startsWith('{') || firstLine.startsWith('[')) {
		try {
			JSON.parse(text);
			return 'json';
		} catch {
			// Check if it's JSON Lines (one JSON object per line)
			const jsonLineCount = lines.slice(0, Math.min(10, lines.length)).filter((line) => {
				try {
					const trimmed = line.trim();
					if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
						JSON.parse(trimmed);
						return true;
					}
				} catch {
					return false;
				}
				return false;
			}).length;

			if (jsonLineCount >= Math.min(3, lines.length)) {
				return 'json';
			}
		}
	}

	// Check for Kubernetes describe output
	// Typical patterns: "Name:", "Namespace:", "Labels:", "Annotations:", "Status:", "Events:"
	const k8sPatterns = /^(Name|Namespace|Labels|Annotations|Status|Events|Conditions|Spec|Metadata):/i;
	const k8sIndentedPattern = /^\s{2,}\S+:/;
	const k8sMatchCount = lines
		.slice(0, Math.min(20, lines.length))
		.filter((line) => k8sPatterns.test(line) || k8sIndentedPattern.test(line)).length;

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
	return 'plain';
}
