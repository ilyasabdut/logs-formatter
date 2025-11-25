import { detectLogFormat } from './detector.js';
import { parseJSON } from './json.js';
import { parseWebServerLogs } from './webserver.js';
import { parseKubernetes } from './kubernetes.js';
import { parsePlainText } from './plain.js';

/**
 * Main formatter function that routes to appropriate parser
 * @param {string} text - Input log text
 * @param {string} logType - Log type (auto or specific)
 * @param {string} outputFormat - Desired output format
 * @returns {string} - Formatted output
 */
export function formatLogs(text, logType = 'auto', outputFormat = 'auto') {
	if (!text || text.trim().length === 0) {
		throw new Error('Input cannot be empty');
	}

	// Detect log format if set to auto
	const detectedType = logType === 'auto' ? detectLogFormat(text) : logType;

	try {
		switch (detectedType) {
			case 'json':
				return parseJSON(text, outputFormat);
			case 'apache':
			case 'nginx':
				return parseWebServerLogs(text, outputFormat);
			case 'kubernetes':
				return parseKubernetes(text, outputFormat);
			case 'plain':
			default:
				return parsePlainText(text, outputFormat);
		}
	} catch (error) {
		throw new Error(`Formatting failed: ${error.message}`);
	}
}

export { detectLogFormat };
