/**
 * Parse Kubernetes describe output
 * @param {string} text - Input Kubernetes describe text
 * @param {string} outputFormat - Desired output format
 * @returns {string} - Formatted output
 */
export function parseKubernetes(text, outputFormat = 'auto') {
	const lines = text.trim().split('\n');
	const result = {};
	let currentSection = null;
	let currentIndent = 0;
	const stack = [result];

	for (const line of lines) {
		if (!line.trim()) continue;

		// Calculate indentation level
		const indent = line.search(/\S/);
		const content = line.trim();

		// Skip separator lines
		if (/^[-=]+$/.test(content)) continue;

		// Check if it's a key-value line
		const kvMatch = content.match(/^([^:]+):\s*(.*)$/);

		if (kvMatch) {
			const [, key, value] = kvMatch;
			const cleanKey = key.trim();
			const cleanValue = value.trim();

			// Determine the appropriate level in the hierarchy
			if (indent === 0) {
				// Top-level key
				currentSection = cleanKey;
				if (cleanValue) {
					result[cleanKey] = cleanValue;
				} else {
					result[cleanKey] = {};
				}
				currentIndent = 0;
				stack.length = 1;
				stack[0] = result;
			} else {
				// Nested key
				const parent = stack[stack.length - 1];

				if (indent > currentIndent) {
					// Going deeper
					const newParent = parent[currentSection] || {};
					if (typeof newParent === 'string') {
						// Convert to object if it was a string
						parent[currentSection] = { value: newParent };
					}
					stack.push(parent[currentSection]);
				} else if (indent < currentIndent) {
					// Going back up
					const levels = Math.floor((currentIndent - indent) / 2);
					for (let i = 0; i < levels; i++) {
						stack.pop();
					}
				}

				const current = stack[stack.length - 1];
				currentSection = cleanKey;

				if (cleanValue) {
					current[cleanKey] = parseValue(cleanValue);
				} else {
					current[cleanKey] = {};
				}

				currentIndent = indent;
			}
		} else {
			// List item or continuation
			const parent = stack[stack.length - 1];
			if (currentSection && parent[currentSection]) {
				if (typeof parent[currentSection] === 'object' && !Array.isArray(parent[currentSection])) {
					// Convert to array for list items
					parent[currentSection] = [content];
				} else if (Array.isArray(parent[currentSection])) {
					parent[currentSection].push(content);
				}
			}
		}
	}

	// Compact the result
	const compacted = compactKubernetesData(result);

	return formatOutput(compacted, outputFormat);
}

/**
 * Parse value to appropriate type
 */
function parseValue(value) {
	if (value === 'true') return true;
	if (value === 'false') return false;
	if (value === '<none>' || value === '<nil>' || value === 'null') return null;
	if (/^\d+$/.test(value)) return parseInt(value, 10);
	return value;
}

/**
 * Compact Kubernetes data by removing empty objects and null values
 */
function compactKubernetesData(obj) {
	if (obj === null || obj === undefined) return null;
	if (typeof obj !== 'object') return obj;

	if (Array.isArray(obj)) {
		const arr = obj.map(compactKubernetesData).filter((item) => item !== null && item !== undefined);
		return arr.length > 0 ? arr : null;
	}

	const result = {};
	for (const [key, value] of Object.entries(obj)) {
		if (value === null || value === undefined || value === '') {
			continue;
		}

		if (typeof value === 'object') {
			const compacted = compactKubernetesData(value);
			if (compacted !== null && (!Array.isArray(compacted) || compacted.length > 0)) {
				result[key] = compacted;
			}
		} else {
			result[key] = value;
		}
	}

	return Object.keys(result).length > 0 ? result : null;
}

/**
 * Format output based on preference
 */
function formatOutput(data, outputFormat) {
	if (outputFormat === 'keyvalue') {
		return toKeyValueLines(data);
	} else if (outputFormat === 'compact' || outputFormat === 'auto') {
		return JSON.stringify(data);
	} else if (outputFormat === 'jsonlines') {
		// For K8s, JSON Lines doesn't make much sense, use compact JSON
		return JSON.stringify(data);
	} else {
		return JSON.stringify(data, null, 2);
	}
}

/**
 * Convert to key-value lines
 */
function toKeyValueLines(data, prefix = '') {
	const lines = [];

	if (data === null || data === undefined) return '';

	if (Array.isArray(data)) {
		data.forEach((item, idx) => {
			const newPrefix = prefix ? `${prefix}[${idx}]` : `[${idx}]`;
			lines.push(toKeyValueLines(item, newPrefix));
		});
	} else if (typeof data === 'object') {
		for (const [key, value] of Object.entries(data)) {
			const newKey = prefix ? `${prefix}.${key}` : key;

			if (value === null || value === undefined) continue;

			if (typeof value === 'object') {
				lines.push(toKeyValueLines(value, newKey));
			} else {
				lines.push(`${newKey}=${value}`);
			}
		}
	} else {
		lines.push(`${prefix}=${data}`);
	}

	return lines.filter((l) => l).join('\n');
}
