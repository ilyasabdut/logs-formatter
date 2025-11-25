/**
 * Parse and compact JSON logs
 * @param {string} text - Input JSON text
 * @param {string} outputFormat - Desired output format
 * @returns {string} - Formatted output
 */
export function parseJSON(text, outputFormat = 'auto') {
	try {
		// Try parsing as single JSON object/array
		let data = JSON.parse(text);
		return formatJSON(data, outputFormat);
	} catch {
		// Try parsing as JSON Lines (one object per line)
		const lines = text.trim().split('\n');
		const objects = [];

		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;

			try {
				const obj = JSON.parse(trimmed);
				objects.push(obj);
			} catch {
				// Skip invalid lines
			}
		}

		if (objects.length > 0) {
			return formatJSON(objects, outputFormat);
		}

		throw new Error('Invalid JSON format');
	}
}

/**
 * Format JSON data based on output preference
 */
function formatJSON(data, outputFormat) {
	if (outputFormat === 'jsonlines' || (outputFormat === 'auto' && Array.isArray(data))) {
		// Convert to JSON Lines format (one object per line)
		if (Array.isArray(data)) {
			return data.map((item) => JSON.stringify(compactObject(item))).join('\n');
		} else {
			return JSON.stringify(compactObject(data));
		}
	} else if (outputFormat === 'keyvalue') {
		// Convert to key-value lines
		return toKeyValueLines(data);
	} else if (outputFormat === 'compact') {
		// Compact JSON (minimal whitespace)
		return JSON.stringify(compactObject(data));
	} else {
		// Auto: use JSON Lines for arrays, compact JSON for objects
		if (Array.isArray(data)) {
			return data.map((item) => JSON.stringify(compactObject(item))).join('\n');
		} else {
			return JSON.stringify(compactObject(data));
		}
	}
}

/**
 * Compact object by removing null/undefined and shortening keys where safe
 * Aggressively removes noise and verbosity
 */
function compactObject(obj) {
	if (obj === null || obj === undefined) return null;
	if (typeof obj !== 'object') return obj;

	if (Array.isArray(obj)) {
		return obj.map(compactObject).filter((item) => item !== null && item !== undefined);
	}

	const result = {};
	const keyShortcuts = {
		timestamp: 'ts',
		message: 'msg',
		level: 'lvl',
		severity: 'sev',
		logger: 'log',
		source: 'src',
		status: 'sts',
		error: 'err',
		warning: 'warn',
		debug: 'dbg',
		trace: 'trc'
	};

	for (const [key, value] of Object.entries(obj)) {
		// Skip null, undefined, empty strings, empty arrays, empty objects
		if (
			value === null ||
			value === undefined ||
			value === '' ||
			(Array.isArray(value) && value.length === 0) ||
			(typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
		) {
			continue;
		}

		// Skip common noisy fields
		const lowerKey = key.toLowerCase();
		if (['hostname', 'host', 'pid', 'version', 'v', '_id', 'id'].includes(lowerKey) && typeof value === 'string') {
			continue;
		}

		// Shorten common keys
		const shortKey = keyShortcuts[lowerKey] || key;

		// Recursively compact nested objects
		if (typeof value === 'object') {
			const compacted = compactObject(value);
			if (compacted !== null && (!Array.isArray(compacted) || compacted.length > 0)) {
				result[shortKey] = compacted;
			}
		} else {
			result[shortKey] = value;
		}
	}

	return result;
}

/**
 * Convert JSON to key-value lines format
 */
function toKeyValueLines(data) {
	const lines = [];

	function processObject(obj, prefix = '') {
		if (obj === null || obj === undefined) return;

		if (Array.isArray(obj)) {
			obj.forEach((item, idx) => {
				processObject(item, prefix ? `${prefix}[${idx}]` : `[${idx}]`);
			});
		} else if (typeof obj === 'object') {
			for (const [key, value] of Object.entries(obj)) {
				const newKey = prefix ? `${prefix}.${key}` : key;

				if (value === null || value === undefined || value === '') {
					continue;
				}

				if (typeof value === 'object') {
					processObject(value, newKey);
				} else {
					lines.push(`${newKey}=${value}`);
				}
			}
		} else {
			lines.push(`${prefix}=${obj}`);
		}
	}

	if (Array.isArray(data)) {
		data.forEach((item, idx) => {
			if (idx > 0) lines.push('---');
			processObject(item);
		});
	} else {
		processObject(data);
	}

	return lines.join('\n');
}
