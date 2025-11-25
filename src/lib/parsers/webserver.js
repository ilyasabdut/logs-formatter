/**
 * Parse Apache/Nginx web server logs
 * @param {string} text - Input log text
 * @param {string} outputFormat - Desired output format
 * @returns {string} - Formatted output
 */
export function parseWebServerLogs(text, outputFormat = 'auto') {
	const lines = text.trim().split('\n');
	const parsed = [];

	// Common Log Format pattern
	// IP - - [timestamp] "METHOD /path HTTP/version" status size
	const clfPattern =
		/^(\S+)\s+(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+"([^"]*)"\s+(\d{3})\s+(\S+)(?:\s+"([^"]*)")?(?:\s+"([^"]*)")?/;

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;

		const match = trimmed.match(clfPattern);
		if (match) {
			const [, ip, , user, timestamp, request, status, size, referer, userAgent] = match;

			const entry = {
				ip,
				ts: compactTimestamp(timestamp),
				req: compactRequest(request),
				st: status,
				sz: size !== '-' ? size : undefined,
				ref: referer && referer !== '-' ? referer : undefined,
				ua: userAgent && userAgent !== '-' ? compactUserAgent(userAgent) : undefined
			};

			// Remove undefined fields
			Object.keys(entry).forEach((key) => entry[key] === undefined && delete entry[key]);

			parsed.push(entry);
		} else {
			// If line doesn't match pattern, keep it as-is (simplified)
			parsed.push({ raw: trimmed });
		}
	}

	return formatOutput(parsed, outputFormat);
}

/**
 * Compact timestamp: 10/Oct/2000:13:55:36 -0700 -> 2000-10-10T13:55:36-07:00 (ISO) or shorter
 */
function compactTimestamp(timestamp) {
	// Format: 10/Oct/2000:13:55:36 -0700
	// Return as: 2000-10-10T13:55
	try {
		const match = timestamp.match(/(\d{2})\/(\w{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})\s+([+-]\d{4})/);
		if (match) {
			const [, day, month, year, hour, min] = match;
			const months = {
				Jan: '01',
				Feb: '02',
				Mar: '03',
				Apr: '04',
				May: '05',
				Jun: '06',
				Jul: '07',
				Aug: '08',
				Sep: '09',
				Oct: '10',
				Nov: '11',
				Dec: '12'
			};
			return `${year}-${months[month]}-${day}T${hour}:${min}`;
		}
	} catch {
		// Return original if parsing fails
	}
	return timestamp;
}

/**
 * Compact HTTP request: "GET /path HTTP/1.1" -> "GET /path"
 */
function compactRequest(request) {
	// Remove HTTP version
	return request.replace(/\s+HTTP\/[\d.]+$/, '');
}

/**
 * Compact User-Agent string (keep only essential info)
 */
function compactUserAgent(ua) {
	// Extract browser/OS info, remove detailed version numbers
	// This is a simple approach - just truncate if too long
	if (ua.length > 50) {
		// Extract key parts
		const simplified = ua
			.replace(/\([^)]+\)/g, '') // Remove parenthetical info
			.replace(/\s+/g, ' ')
			.trim();
		return simplified.substring(0, 50);
	}
	return ua;
}

/**
 * Format output based on preference
 */
function formatOutput(data, outputFormat) {
	if (outputFormat === 'jsonlines' || outputFormat === 'auto') {
		return data.map((entry) => JSON.stringify(entry)).join('\n');
	} else if (outputFormat === 'keyvalue') {
		return data
			.map((entry) => {
				return Object.entries(entry)
					.map(([k, v]) => `${k}=${v}`)
					.join(' ');
			})
			.join('\n');
	} else if (outputFormat === 'compact') {
		return JSON.stringify(data);
	} else {
		return data.map((entry) => JSON.stringify(entry)).join('\n');
	}
}
