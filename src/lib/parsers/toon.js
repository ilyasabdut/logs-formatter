/**
 * TOON (Token-Oriented Object Notation) encoder for LLM-optimized log formatting
 * Based on @toon-format/toon package
 */

import { encode } from '@toon-format/toon';

/**
 * Encode structured data to TOON format
 * @param {any} data - Data to encode (object, array, or primitive)
 * @returns {string} - TOON formatted string
 */
export function encodeToon(data) {
	// Debug logging
	console.log('encodeToon input:', data);
	console.log('encodeToon input type:', typeof data);
	console.log('encodeToon isArray:', Array.isArray(data));

	// Handle empty, null, or undefined data
	if (!data || data === null || data === undefined) {
		throw new Error('No data to encode');
	}

	// Handle empty objects and arrays
	if (typeof data === 'object') {
		const keys = Object.keys(data);
		console.log('encodeToon keys:', keys);
		if (Array.isArray(data) && data.length === 0) {
			throw new Error('Empty array provided');
		}
		if (!Array.isArray(data) && keys.length === 0) {
			throw new Error('Empty object provided');
		}
	}

	try {
		// Handle arrays and objects
		if (Array.isArray(data)) {
			const result = encodeArrayToToon(data);
			console.log('encodeToon array result:', result);
			return result;
		} else if (typeof data === 'object') {
			const result = encodeObjectToToon(data);
			console.log('encodeToon object result:', result);
			return result;
		} else {
			// Handle primitives
			const result = encodePrimitiveToToon(data);
			console.log('encodeToon primitive result:', result);
			return result;
		}
	} catch (error) {
		// Enhanced error reporting
		const errorType = Array.isArray(data) ? 'array' : typeof data;
		throw new Error(`TOON encoding failed for ${errorType}: ${error.message}`);
	}
}

/**
 * Encode array to TOON format (TOON's sweet spot)
 * @param {Array} array - Array to encode
 * @returns {string} - TOON formatted string
 */
function encodeArrayToToon(array) {
	if (array.length === 0) {
		return '[]';
	}

	// Check if array contains uniform objects (best case for TOON)
	const firstItem = array[0];
	const isUniform = array.every(item => 
		typeof item === 'object' && 
		item !== null && 
		!Array.isArray(item) &&
		JSON.stringify(Object.keys(item).sort()) === JSON.stringify(Object.keys(firstItem).sort())
	);

	if (isUniform && array.length > 1) {
		// Use tabular format for uniform arrays
		const fields = Object.keys(firstItem).sort();
		const lines = [];

		// Add header with count and field declaration
		const header = `${fields.length > 0 ? `${fields.join(',')}` : ''}`;
		if (header) {
			lines.push(`${fields.length > 0 ? '' : ''}`);
		}

		// Add array data rows
		for (const item of array) {
			const row = fields.map(field => formatValue(item[field])).join(',');
			lines.push(row);
		}

		// Add field declaration header
		const fieldHeader = fields.length > 0 ? `{${header}}` : '';
		const countHeader = `[${array.length}]`;
		
		if (fields.length > 0) {
			return `${countHeader}${fieldHeader}:\n  ${lines.join('\n  ')}`;
		} else {
			return `${countHeader}:\n  ${lines.join('\n  ')}`;
		}
	} else {
		// Use standard TOON encoding for non-uniform arrays
		try {
			return encode(array);
		} catch {
			// Fallback to manual encoding
			return encodeArrayManually(array);
		}
	}
}

/**
 * Encode object to TOON format
 * @param {Object} obj - Object to encode
 * @returns {string} - TOON formatted string
 */
function encodeObjectToToon(obj) {
	// Try standard TOON encoding first
	try {
		return encode(obj);
	} catch {
		// Fallback to manual encoding
		return encodeObjectManually(obj);
	}
}

/**
 * Encode primitive value to TOON format
 * @param {any} value - Primitive value
 * @returns {string} - TOON formatted string
 */
function encodePrimitiveToToon(value) {
	return String(value);
}

/**
 * Format a value for TOON tabular output
 * @param {any} value - Value to format
 * @returns {string} - Formatted value
 */
function formatValue(value) {
	console.log('formatValue input:', value);
	console.log('formatValue type:', typeof value);

	// Handle null and undefined
	if (value === null || value === undefined) {
		console.log('formatValue: returning empty string for null/undefined');
		return '';
	}

	// Handle primitives
	if (typeof value === 'boolean' || typeof value === 'number') {
		const result = value.toString();
		console.log('formatValue: returning primitive:', result);
		return result;
	}

	if (typeof value === 'string') {
		// Escape commas and newlines in strings
		const escaped = value.replace(/,/g, '\\,').replace(/\n/g, '\\n');
		console.log('formatValue: returning escaped string:', escaped);
		return escaped;
	}

	// Handle objects and arrays - always use JSON.stringify to avoid [object Object]
	if (typeof value === 'object') {
		try {
			// Special handling for Date objects
			if (value instanceof Date) {
				const result = value.toISOString().replace(/,/g, '\\,').replace(/\n/g, '\\n');
				console.log('formatValue: returning Date:', result);
				return result;
			}

			// Special handling for Error objects
			if (value instanceof Error) {
				const errorObj = {
					name: value.name,
					message: value.message,
					stack: value.stack
				};
				const json = JSON.stringify(errorObj);
				const result = json.replace(/,/g, '\\,').replace(/\n/g, '\\n');
				console.log('formatValue: returning Error:', result);
				return result;
			}

			// Handle regular objects and arrays
			const json = JSON.stringify(value);
			const result = json.replace(/,/g, '\\,').replace(/\n/g, '\\n');
			console.log('formatValue: returning JSON:', result);
			return result;
		} catch (error) {
			// Fallback for objects that can't be JSON.stringified
			try {
				const result = String(value);
				console.log('formatValue: using String() fallback:', result);
				return result;
			} catch {
				const result = '[Unserializable]';
				console.log('formatValue: using [Unserializable]:', result);
				return result;
			}
		}
	}

	// Final fallback
	const result = String(value);
	console.log('formatValue: using final String() fallback:', result);
	return result;
}

/**
 * Manual encoding fallback for arrays
 * @param {Array} array - Array to encode
 * @returns {string} - Manually encoded string
 */
function encodeArrayManually(array) {
	const lines = [];

	for (let i = 0; i < array.length; i++) {
		const item = array[i];
		if (typeof item === 'object' && item !== null) {
			try {
				lines.push(encodeObjectManually(item));
			} catch (error) {
				// If encoding fails, use formatValue as fallback
				lines.push(formatValue(item));
			}
		} else {
			lines.push(formatValue(item));
		}
	}

	return lines.join('\n');
}

/**
 * Manual encoding fallback for objects
 * @param {Object} obj - Object to encode
 * @returns {string} - Manually encoded string
 */
function encodeObjectManually(obj) {
	const lines = [];
	const keys = Object.keys(obj);

	for (const key of keys) {
		const value = obj[key];
		if (value !== null && value !== undefined) {
			if (typeof value === 'object') {
				try {
					const encodedValue = Array.isArray(value) ?
						encodeArrayManually(value) :
						encodeObjectManually(value);
					lines.push(`${key}:\n  ${encodedValue.replace(/\n/g, '\n  ')}`);
				} catch (error) {
					// If encoding fails, use formatValue as fallback
					lines.push(`${key}: ${formatValue(value)}`);
				}
			} else {
				lines.push(`${key}: ${formatValue(value)}`);
			}
		}
	}

	return lines.join('\n');
}

/**
 * Get TOON encoding statistics
 * @param {any} originalData - Original data
 * @param {string} toonOutput - TOON encoded output
 * @returns {Object} - Statistics object
 */
export function getToonStats(originalData, toonOutput) {
	const originalSize = JSON.stringify(originalData).length;
	const toonSize = toonOutput.length;
	const compressionRatio = originalSize > 0 ? ((originalSize - toonSize) / originalSize) * 100 : 0;
	
	return {
		originalSize,
		toonSize,
		compressionRatio: Math.round(compressionRatio * 100) / 100,
		tokensSaved: originalSize - toonSize
	};
}