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
		processed = processed.replace(/[─│┌┐└┘├┤┬┴┼═║╔╗╚╝╠╣╦╩╬━┃┏┓┗┛┣┫┳┻╋]+/g, '');
		processed = processed.replace(/^[-=_*#]+$/, ''); // Remove separator lines

		// Remove excessive whitespace
		processed = processed.replace(/\s+/g, ' ').trim();

		if (!processed) continue;

		// Remove common log decorations
		processed = processed.replace(/^\[.*?\]\s*/, ''); // Remove [brackets]
		processed = processed.replace(/^[<>]+\s*/, ''); // Remove < > markers
		processed = processed.replace(/\s+[-|:]\s+/g, ' '); // Replace " - " or " | " with space

		// Deduplicate: skip if we just added the same line
		if (compacted.length > 0 && compacted[compacted.length - 1] === processed) {
			continue;
		}

		compacted.push(processed);
	}

	// Join with newlines for maximum readability
	return compacted.join('\n');
}

