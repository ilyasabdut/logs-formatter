// Pre-compiled regex patterns for performance
const BOX_DRAWING_REGEX = /[─│┌┐└┘├┤┬┴┼═║╔╗╚╝╠╣╦╩╬━┃┏┓┗┛┣┫┳┻╋]+/g;
const SEPARATOR_LINE_REGEX = /^[-=_*#]+$/;
const WHITESPACE_REGEX = /\s+/g;
const BRACKETS_REGEX = /^\[.*?\]\s*/;
const MARKERS_REGEX = /^[<>]+\s*/;
const SEPARATOR_CHARS_REGEX = /\s+[-|:]\s+/g;

/**
 * Parse plain text logs
 * Focus on aggressive compaction - remove decorative elements, deduplicate, compress whitespace
 * @param {string} text - Input plain text
 * @param {string} outputFormat - Desired output format
 * @returns {string} - Formatted output
 */
export function parsePlainText(text, outputFormat = 'auto') {
	const lines = text.trim().split('\n');
	const compacted = [];

	for (const line of lines) {
		let processed = line.trim();
		if (!processed) continue;

		// Remove decorative characters (box drawing, separators, etc.)
		processed = processed.replace(BOX_DRAWING_REGEX, '');
		processed = processed.replace(SEPARATOR_LINE_REGEX, ''); // Remove separator lines

		// Remove excessive whitespace
		processed = processed.replace(WHITESPACE_REGEX, ' ').trim();

		if (!processed) continue;

		// Remove common log decorations
		processed = processed.replace(BRACKETS_REGEX, ''); // Remove [brackets]
		processed = processed.replace(MARKERS_REGEX, ''); // Remove < > markers
		processed = processed.replace(SEPARATOR_CHARS_REGEX, ' '); // Replace " - " or " | " with space

		// Deduplicate: skip if we just added the same line
		if (compacted.length > 0 && compacted[compacted.length - 1] === processed) {
			continue;
		}

		compacted.push(processed);
	}

	// Join with newlines for maximum readability
	return compacted.join('\n');
}

