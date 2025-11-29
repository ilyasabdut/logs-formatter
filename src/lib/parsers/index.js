import { detectLogFormat } from './detector.js';
import { parseJSON } from './json.js';
import { parseWebServerLogs } from './webserver.js';
import { parseKubernetes } from './kubernetes.js';
import { parsePlainText } from './plain.js';
import { encodeToon } from './toon.js';

/**
 * Main formatter function that routes to appropriate parser
 * @param {string} text - Input log text
 * @param {string} logType - Log type (auto or specific)
 * @param {string} outputFormat - Desired output format
 * @returns {Object} - { output: string, selectedFormat: string, compressionRatio: number }
 */
export function formatLogs(text, logType = 'auto', outputFormat = 'auto') {
	console.log('formatLogs called:', { text: text?.substring(0, 100), logType, outputFormat });

	if (!text || text.trim().length === 0) {
		throw new Error('Input cannot be empty');
	}

	// Detect log format if set to auto
	const detectedType = logType === 'auto' ? detectLogFormat(text) : logType;
	console.log('detectedType:', detectedType);

	try {
		// Handle auto mode with smart format selection
		if (outputFormat === 'auto') {
			return autoFormat(text, detectedType);
		}

		// For specific formats, route to appropriate handler
		if (outputFormat === 'toon') {
			return formatToToon(text, detectedType);
		}

		// Handle other formats
		let formatted;
		let formatName;
		switch (detectedType) {
			case 'json':
				formatted = parseJSON(text, outputFormat);
				formatName = outputFormat;
				break;
			case 'apache':
			case 'nginx':
				formatted = parseWebServerLogs(text, outputFormat);
				formatName = outputFormat;
				break;
			case 'kubernetes':
				formatted = parseKubernetes(text, outputFormat);
				formatName = outputFormat;
				break;
			case 'plain':
			default:
				formatted = parsePlainText(text, outputFormat);
				formatName = outputFormat;
				break;
		}

		return {
			output: formatted,
			selectedFormat: formatName,
			compressionRatio: calculateCompression(text, formatted)
		};
	} catch (error) {
		throw new Error(`Formatting failed: ${error.message}`);
	}
}

/**
 * Calculate compression ratio
 */
function calculateCompression(original, formatted) {
	const originalSize = original.length;
	// Handle case where formatted might be an object (for pretty format)
	const formattedSize = typeof formatted === 'object' ? JSON.stringify(formatted).length : formatted.length;
	return ((originalSize - formattedSize) / originalSize) * 100;
}

/**
 * Format logs to TOON format by first parsing to structured data
 * @param {string} text - Input log text
 * @param {string} detectedType - Detected log type
 * @returns {Object} - { output: string, selectedFormat: string, compressionRatio: number }
 */
function formatToToon(text, detectedType) {
	console.log('formatToToon input:', text.substring(0, 200));
	console.log('formatToToon detectedType:', detectedType);

	// Parse to structured data first
	let structuredData;

	switch (detectedType) {
		case 'json':
			structuredData = parseToStructuredJSON(text);
			break;
		case 'apache':
		case 'nginx':
			structuredData = parseToStructuredWebServer(text);
			break;
		case 'kubernetes':
			structuredData = parseToStructuredKubernetes(text);
			break;
		case 'plain':
		default:
			structuredData = parseToStructuredPlain(text);
			break;
	}

	console.log('formatToToon structuredData:', structuredData);

	// Convert structured data to TOON
	const output = encodeToon(structuredData);
	console.log('formatToToon output:', output);

	return {
		output,
		selectedFormat: 'TOON (LLM-Optimized)',
		compressionRatio: calculateCompression(text, output)
	};
}

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
 * Parse JSON text to structured data
 */
function parseToStructuredJSON(text) {
	try {
		// First, try to strip comments and parse
		const cleanedText = stripComments(text);
		return JSON.parse(cleanedText);
	} catch {
		// Try parsing as JSON Lines (one object per line)
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
			return objects;
		}

		throw new Error('Invalid JSON format');
	}
}

/**
 * Parse web server logs to structured data
 */
function parseToStructuredWebServer(text) {
	const lines = text.trim().split('\n');
	const logs = [];

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;

		// Skip comment lines
		if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
			continue;
		}

		// Simple regex for Apache/Nginx log format
		const logPattern = /^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"([^"]+)"\s+(\d+)\s+(\S+)/;
		const match = trimmed.match(logPattern);

		if (match) {
			logs.push({
				ip: match[1],
				timestamp: match[2],
				request: match[3],
				status: parseInt(match[4]),
				size: match[5]
			});
		}
	}

	return logs;
}

/**
 * Parse Kubernetes logs to structured data
 */
function parseToStructuredKubernetes(text) {
	const lines = text.trim().split('\n');
	const data = {};

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;

		// Skip comment lines
		if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
			continue;
		}

		// Match key-value pairs like "Name:         my-pod"
		const kvPattern = /^([^:]+):\s*(.+)$/;
		const match = trimmed.match(kvPattern);

		if (match) {
			const key = match[1].trim();
			const value = match[2].trim();
			data[key] = value;
		}
	}

	return data;
}

/**
 * Parse plain text logs to structured data
 */
function parseToStructuredPlain(text) {
	const lines = text.trim().split('\n');
	const logs = [];

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;

		// Skip comment lines
		if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
			continue;
		}

		// Simple pattern matching for common log formats
		// Try to extract timestamp, level, and message
		const logPattern = /^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}[Z]?)\s+(\w+)\s+(.+)/;
		const match = trimmed.match(logPattern);

		if (match) {
			logs.push({
				timestamp: match[1],
				level: match[2],
				message: match[3]
			});
		} else {
			// Fallback: just store as message
			logs.push({
				message: trimmed
			});
		}
	}

	return logs.length === 1 ? logs[0] : logs;
}

/**
 * Smart auto-format selection that tests all formats and chooses the best compression
 * @param {string} text - Input log text
 * @param {string} detectedType - Detected log type
 * @returns {Object} - { output: string, selectedFormat: string, compressionRatio: number }
 */
function autoFormat(text, detectedType) {
	// First parse to structured data
	let structuredData;

	try {
		switch (detectedType) {
			case 'json':
				structuredData = parseToStructuredJSON(text);
				break;
			case 'apache':
			case 'nginx':
				structuredData = parseToStructuredWebServer(text);
				break;
			case 'kubernetes':
				structuredData = parseToStructuredKubernetes(text);
				break;
			case 'plain':
			default:
				structuredData = parseToStructuredPlain(text);
				break;
		}
	} catch (error) {
		// Fallback to plain text parsing
		structuredData = parseToStructuredPlain(text);
	}

	if (!structuredData) {
		throw new Error('Unable to parse input data');
	}

	// Test all formats and calculate compression ratios
	// Note: 'pretty' format is excluded - it's for readability, not compression
	const formats = [
		{ name: 'jsonlines', displayName: 'JSON Lines', getOutput: () => formatAsJSONLines(structuredData) },
		{ name: 'compact', displayName: 'Compact JSON', getOutput: () => formatAsCompact(structuredData) },
		{ name: 'keyvalue', displayName: 'Key-Value Lines', getOutput: () => formatAsKeyValue(structuredData) },
		{ name: 'toon', displayName: 'TOON (LLM-Optimized)', getOutput: () => encodeToon(structuredData) }
	];

	let bestFormat = formats[0];
	let bestRatio = -Infinity;
	const originalSize = text.length;

	for (const format of formats) {
		try {
			const output = format.getOutput();
			const outputSize = output.length;
			const compressionRatio = ((originalSize - outputSize) / originalSize) * 100;

			// Track the best format (highest compression ratio)
			if (compressionRatio > bestRatio) {
				bestRatio = compressionRatio;
				bestFormat = format;
			}
		} catch (error) {
			// Skip formats that fail
			continue;
		}
	}

	// Return the best format with information
	try {
		const output = bestFormat.getOutput();
		return {
			output,
			selectedFormat: bestFormat.displayName,
			compressionRatio: Math.round(bestRatio * 100) / 100
		};
	} catch (error) {
		// Fallback to JSON Lines if best format fails
		const fallbackOutput = formatAsJSONLines(structuredData);
		return {
			output: fallbackOutput,
			selectedFormat: 'JSON Lines',
			compressionRatio: calculateCompression(text, fallbackOutput)
		};
	}
}

/**
 * Format data as JSON Lines
 */
function formatAsJSONLines(data) {
	if (Array.isArray(data)) {
		return data.map(item => JSON.stringify(compactObjectForJSON(item))).join('\n');
	} else {
		return JSON.stringify(compactObjectForJSON(data));
	}
}

/**
 * Format data as Compact JSON
 */
function formatAsCompact(data) {
	return JSON.stringify(compactObjectForJSON(data));
}

/**
 * Format data as Key-Value Lines
 */
function formatAsKeyValue(data) {
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

/**
 * Format data as Pretty/Beautified JSON
 * Note: Does NOT compact or filter fields - shows all data for human readability
 */
function formatAsPretty(data) {
	try {
		// For beautified format, we want to preserve ALL fields (no compacting/filtering)
		// This is different from other formats which optimize for compression

		if (data === null || data === undefined) {
			return {};
		}

		// If it's already a valid object/array, return as-is
		if (typeof data === 'object') {
			return data;
		}

		// For primitive values, wrap in an object
		return { value: data };
	} catch (error) {
		console.error('Error formatting as pretty JSON:', error);
		// Fallback to empty object
		return {};
	}
}

/**
 * Beautify JSON with proper indentation
 */
function beautifyJSON(obj, currentIndent = 0) {
	// Handle null, undefined, and non-object types
	if (obj === null || obj === undefined) {
		return 'null';
	}
	if (typeof obj !== 'object') {
		return JSON.stringify(obj);
	}

	// Handle arrays
	if (Array.isArray(obj)) {
		if (obj.length === 0) return '[]';

		try {
			const elements = obj.map(item => {
				const indented = beautifyJSON(item, currentIndent + 2);
				return ' '.repeat(currentIndent + 2) + indented;
			});

			return '[\n' + elements.join(',\n') + '\n' + ' '.repeat(currentIndent) + ']';
		} catch (error) {
			console.error('Error beautifying array:', error);
			return JSON.stringify(obj);
		}
	}

	// Handle objects
	try {
		const keys = Object.keys(obj);
		if (keys.length === 0) return '{}';

		const properties = keys.map(key => {
			const value = beautifyJSON(obj[key], currentIndent + 2);
			return ' '.repeat(currentIndent + 2) + `"${key}": ${value}`;
		});

		return '{\n' + properties.join(',\n') + '\n' + ' '.repeat(currentIndent) + '}';
	} catch (error) {
		console.error('Error beautifying object:', error);
		return JSON.stringify(obj);
	}
}

/**
 * Compact object for JSON formatting (separate from TOON-specific compaction)
 */
function compactObjectForJSON(obj) {
	try {
		if (obj === null || obj === undefined) return null;
		if (typeof obj !== 'object') return obj;

		if (Array.isArray(obj)) {
			const filteredArray = obj
				.map(item => compactObjectForJSON(item))
				.filter(item => item !== null && item !== undefined);

			// Ensure we return a valid array or null if empty
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
			if (typeof value === 'object') {
				const compacted = compactObjectForJSON(value);
				if (compacted !== null && (!Array.isArray(compacted) || compacted.length > 0)) {
					result[shortKey] = compacted;
				}
			} else {
				result[shortKey] = value;
			}
		}

		// Return the object, or null if it's empty
		const keys = Object.keys(result);
		return keys.length > 0 ? result : null;
	} catch (error) {
		console.error('Error compacting object for JSON:', error);
		// Return the original object if compaction fails
		return obj;
	}
}

export { detectLogFormat };