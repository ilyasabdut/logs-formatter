/**
 * Estimate token count for text
 * This uses a simple approximation based on common LLM tokenization patterns
 *
 * Approximation rules:
 * - 1 token per ~4 characters for English text (GPT standard)
 * - Code/structured data tends to be slightly denser
 * - We use a weighted average approach
 */

/**
 * Estimate tokens using multiple methods and return average
 * @param {string} text - Input text
 * @returns {number} - Estimated token count
 */
export function estimateTokens(text) {
	if (!text || text.length === 0) return 0;

	// Method 1: Character-based (1 token per 4 characters)
	const charBasedEstimate = Math.ceil(text.length / 4);

	// Method 2: Word-based with adjustment (1.3 tokens per word on average)
	const words = text.split(/\s+/).filter((w) => w.length > 0);
	const wordBasedEstimate = Math.ceil(words.length * 1.3);

	// Method 3: Punctuation and special character aware
	// Special characters, brackets, etc. often count as separate tokens
	const specialChars = (text.match(/[{}[\](),.;:!?"\n]/g) || []).length;
	const adjustedEstimate = Math.ceil(words.length * 1.3 + specialChars * 0.5);

	// Use weighted average favoring the character-based method
	// as it's most reliable for mixed content
	const estimate = Math.ceil(
		charBasedEstimate * 0.5 + wordBasedEstimate * 0.25 + adjustedEstimate * 0.25
	);

	return estimate;
}

/**
 * Calculate metrics for text or object
 * @param {string|object} text - Input text or object (for beautified JSON)
 * @returns {Object} - Metrics object with chars, lines, and tokens
 */
export function calculateMetrics(text) {
	if (!text) {
		return {
			chars: 0,
			lines: 0,
			tokens: 0
		};
	}

	// If text is an object (beautified JSON), stringify it for metrics calculation
	let textStr = text;
	if (typeof text === 'object') {
		textStr = JSON.stringify(text, null, 2);
	}

	return {
		chars: textStr.length,
		lines: textStr.split('\n').length,
		tokens: estimateTokens(textStr)
	};
}

/**
 * Calculate compression statistics
 * @param {Object} inputMetrics - Input metrics
 * @param {Object} outputMetrics - Output metrics
 * @returns {Object} - Compression statistics
 */
export function calculateCompression(inputMetrics, outputMetrics) {
	if (!inputMetrics || !outputMetrics || inputMetrics.chars === 0) {
		return {
			charReduction: 0,
			tokenReduction: 0,
			charSaved: 0,
			tokenSaved: 0
		};
	}

	const charReduction =
		((inputMetrics.chars - outputMetrics.chars) / inputMetrics.chars) * 100;
	const tokenReduction =
		((inputMetrics.tokens - outputMetrics.tokens) / inputMetrics.tokens) * 100;

	return {
		charReduction: Math.max(0, charReduction).toFixed(1),
		tokenReduction: Math.max(0, tokenReduction).toFixed(1),
		charSaved: Math.max(0, inputMetrics.chars - outputMetrics.chars),
		tokenSaved: Math.max(0, inputMetrics.tokens - outputMetrics.tokens)
	};
}
