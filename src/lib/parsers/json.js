/**
 * Parse and compact JSON logs
 * @param {string} text - Input JSON text
 * @param {string} outputFormat - Desired output format
 * @returns {string} - Formatted output
 */
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

export function parseJSON(text, outputFormat = 'auto') {
	try {
		// First, try to strip comments and parse directly
		const cleanedText = stripComments(text);
		// Parse without sanitization - JSON.parse handles whitespace correctly
		let data = JSON.parse(cleanedText);
		return formatJSON(data, outputFormat);
	} catch (error) {
		// If stripping comments didn't work, try parsing as JSON Lines (one object per line)
		const lines = text.trim().split('\n');
		const objects = [];

		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;

			try {
				// Try parsing each line after stripping comments
				const cleanedLine = stripComments(trimmed);
				const obj = JSON.parse(cleanedLine);
				objects.push(obj);
			} catch {
				// Skip invalid lines
			}
		}

		if (objects.length > 0) {
			return formatJSON(objects, outputFormat);
		}

		throw new Error('Invalid JSON: Please check your JSON syntax. Make sure brackets and quotes are properly closed.');
	}
}

/**
 * Beautify JSON with proper indentation and collapsible structure
 * @param {*} obj - JSON object to beautify
 * @param {number} indent - Number of spaces for indentation (default: 2)
 * @returns {string} - Beautified JSON string
 */
function beautifyJSON(obj, indent = 2) {
	// Handle null, undefined, and primitive types
	if (obj === null || obj === undefined) return 'null';
	if (typeof obj !== 'object') {
		return JSON.stringify(obj);
	}

	try {
		// Handle arrays
		if (Array.isArray(obj)) {
			if (obj.length === 0) return '[]';

			const elements = obj.map((item, index) => {
				const indented = beautifyJSON(item, indent + 2);
				return ' '.repeat(indent) + indented;
			});

			return '[\n' + elements.join(',\n') + '\n' + ' '.repeat(Math.max(0, indent - 2)) + ']';
		}

		// Handle objects
		const keys = Object.keys(obj);
		if (keys.length === 0) return '{}';

		const properties = keys.map(key => {
			try {
				const value = beautifyJSON(obj[key], indent + 2);
				return ' '.repeat(indent) + `"${key}": ${value}`;
			} catch (keyError) {
				// If individual key fails, use JSON.stringify as fallback
				return ' '.repeat(indent) + `"${key}": ${JSON.stringify(obj[key])}`;
			}
		});

		return '{\n' + properties.join(',\n') + '\n' + ' '.repeat(Math.max(0, indent - 2)) + '}';
	} catch (error) {
		// Fallback to standard JSON.stringify with proper formatting
		console.warn('BeautifyJSON failed, using fallback:', error);
		try {
			return JSON.stringify(obj, null, 2);
		} catch (fallbackError) {
			// Ultimate fallback
			return JSON.stringify(obj);
		}
	}
}

/**
 * Format JSON data based on output preference
 */
function formatJSON(data, outputFormat) {
	try {
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
		} else if (outputFormat === 'pretty') {
			// For pretty format, return the actual JSON object (not string) so JsonNode can handle it
			// Do NOT compact or filter - preserve all fields for human readability
			if (data === null || data === undefined) {
				return {};
			}
			return data;
		} else {
			// Auto: use JSON Lines for arrays, compact JSON for objects
			if (Array.isArray(data)) {
				return data.map((item) => JSON.stringify(compactObject(item))).join('\n');
			} else {
				return JSON.stringify(compactObject(data));
			}
		}
	} catch (error) {
		console.error('FormatJSON error:', error);
		// Fallback to simple JSON stringify
		try {
			return JSON.stringify(data, null, 2);
		} catch (fallbackError) {
			return '{}';
		}
	}
}

/**
 * Compact object by removing null/undefined and shortening keys where safe
 * Aggressively removes noise and verbosity
 */
function compactObject(obj) {
	try {
		if (obj === null || obj === undefined) return null;
		if (typeof obj !== 'object') return obj;

		if (Array.isArray(obj)) {
			const filteredArray = obj
				.map(item => compactObject(item))
				.filter(item => item !== null && item !== undefined);

			// Return valid array or null if empty
			return filteredArray.length > 0 ? filteredArray : null;
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
			try {
				if (typeof value === 'object') {
					const compacted = compactObject(value);
					if (compacted !== null && (!Array.isArray(compacted) || compacted.length > 0)) {
						result[shortKey] = compacted;
					}
				} else {
					result[shortKey] = value;
				}
			} catch (valueError) {
				// If individual value processing fails, include it as-is
				result[shortKey] = value;
			}
		}

		// Return the object, or null if it's empty
		const keys = Object.keys(result);
		return keys.length > 0 ? result : null;
	} catch (error) {
		// If compacting fails entirely, return the original object
		console.warn('CompactObject failed, returning original:', error);
		return obj;
	}
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