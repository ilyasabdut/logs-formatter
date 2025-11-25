<script>
	import { logType, outputFormat, inputLogs, outputLogs, errorMessage } from '$lib/stores/app.js';
	import { formatLogs, detectLogFormat } from '$lib/parsers/index.js';

	let detectedFormat = 'unknown';

	/**
	 * Update detected format when input changes
	 */
	$: {
		if ($inputLogs && $inputLogs.trim().length > 0) {
			try {
				detectedFormat = detectLogFormat($inputLogs);
			} catch {
				detectedFormat = 'unknown';
			}
		} else {
			detectedFormat = 'unknown';
		}
	}

	/**
	 * Format logs
	 */
	function handleFormat() {
		errorMessage.set('');

		if (!$inputLogs || $inputLogs.trim().length === 0) {
			errorMessage.set('Please provide input logs');
			return;
		}

		try {
			const formatted = formatLogs($inputLogs, $logType, $outputFormat);
			outputLogs.set(formatted);
		} catch (error) {
			errorMessage.set(error.message || 'Failed to format logs');
			outputLogs.set('');
		}
	}

	/**
	 * Clear all fields
	 */
	function handleClear() {
		inputLogs.set('');
		outputLogs.set('');
		errorMessage.set('');
	}
</script>

<div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<div>
			<label for="log-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
				Log Type
			</label>
			<select id="log-type" bind:value={$logType} class="select-custom w-full">
				<option value="auto">Auto Detect</option>
				<option value="json">JSON / JSON Lines</option>
				<option value="apache">Apache / Nginx</option>
				<option value="kubernetes">Kubernetes</option>
				<option value="plain">Plain Text</option>
			</select>
			{#if $logType === 'auto' && detectedFormat !== 'unknown'}
				<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
					Detected: <span class="font-medium capitalize">{detectedFormat}</span>
				</p>
			{/if}
		</div>

		<div>
			<label for="output-format" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
				Output Format
			</label>
			<select id="output-format" bind:value={$outputFormat} class="select-custom w-full">
				<option value="auto">Auto (Recommended)</option>
				<option value="jsonlines">JSON Lines</option>
				<option value="keyvalue">Key-Value Lines</option>
				<option value="compact">Compact JSON</option>
			</select>
		</div>
	</div>

	<div class="flex flex-wrap gap-2">
		<button
			type="button"
			on:click={handleFormat}
			disabled={!$inputLogs || $inputLogs.trim().length === 0}
			class="btn-primary"
		>
			Format Logs
		</button>

		<button type="button" on:click={handleClear} class="btn-secondary">Clear All</button>
	</div>

	{#if $errorMessage}
		<div
			class="bg-red-50 dark:bg-red-900 dark:bg-opacity-30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm"
			role="alert"
		>
			<strong class="font-medium">Error:</strong>
			{$errorMessage}
		</div>
	{/if}
</div>
