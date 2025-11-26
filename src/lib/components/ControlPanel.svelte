<script>
	import { logType, outputFormat, inputLogs, outputLogs, errorMessage } from '$lib/stores/app.js';
	import { formatLogs, detectLogFormat } from '$lib/parsers/index.js';

	let detectedFormat = 'unknown';
	let selectedOutputFormat = null;
	let compressionRatio = 0;

	/**
	 * Get display name for output format
	 */
	function getFormatDisplayName(format) {
		const formatMap = {
			'toon': 'TOON (LLM-Optimized)',
			'jsonlines': 'JSON Lines',
			'keyvalue': 'Key-Value Lines',
			'compact': 'Compact JSON'
		};
		return formatMap[format] || format;
	}

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
			const result = formatLogs($inputLogs, $logType, $outputFormat);
			outputLogs.set(result.output);
			selectedOutputFormat = result.selectedFormat;
			compressionRatio = result.compressionRatio;
		} catch (error) {
			errorMessage.set(error.message || 'Failed to format logs');
			outputLogs.set('');
			selectedOutputFormat = null;
			compressionRatio = 0;
		}
	}

	/**
	 * Clear all fields
	 */
	function handleClear() {
		inputLogs.set('');
		outputLogs.set('');
		errorMessage.set('');
		selectedOutputFormat = null;
		compressionRatio = 0;
	}
</script>

<div class="space-y-6">
	<!-- Log Type Selection -->
	<div class="space-y-3">
		<div class="flex items-center justify-between">
			<label for="log-type" class="block text-sm font-medium text-gray-900 dark:text-gray-100">
				Log Format Detection
			</label>
			<div class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
				Step 1
			</div>
		</div>
		<div class="relative">
			<select id="log-type" bind:value={$logType} class="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer">
				<option value="auto">Auto Detect (Recommended)</option>
				<option value="json">JSON / JSON Lines</option>
				<option value="apache">Apache / Nginx Logs</option>
				<option value="kubernetes">Kubernetes Logs</option>
				<option value="plain">Plain Text</option>
			</select>
			<div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
				<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
				</svg>
			</div>
		</div>
		{#if $logType === 'auto' && detectedFormat !== 'unknown'}
			<div class="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
				<div class="flex-shrink-0">
					<svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
					</svg>
				</div>
				<div class="ml-3">
					<p class="text-sm text-blue-800 dark:text-blue-200">
						<span class="font-medium">Format Detected:</span> <span class="capitalize font-mono bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded text-xs">{detectedFormat}</span>
					</p>
				</div>
			</div>
		{/if}
	</div>

	<!-- Output Format Selection -->
	<div class="space-y-3">
		<div class="flex items-center justify-between">
			<label for="output-format" class="block text-sm font-medium text-gray-900 dark:text-gray-100">
				Output Compression Format
			</label>
			<div class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
				Step 2
			</div>
		</div>
		<div class="relative">
			<select id="output-format" bind:value={$outputFormat} class="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer">
				<option value="auto">Auto (Best Compression)</option>
				<option value="toon">TOON (LLM-Optimized)</option>
				<option value="jsonlines">JSON Lines</option>
				<option value="keyvalue">Key-Value Lines</option>
				<option value="compact">Compact JSON</option>
			</select>
			<div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
				<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
				</svg>
			</div>
		</div>
		{#if $outputFormat === 'auto' && $outputLogs && selectedOutputFormat}
			<div class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
						</svg>
					</div>
					<div class="ml-3">
						<p class="text-sm text-green-800 dark:text-green-200">
							<span class="font-medium">Format Selected:</span> <span class="font-mono bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded text-xs">{selectedOutputFormat}</span>
							{#if compressionRatio > 0}
								<span class="ml-2 text-green-600 dark:text-green-300 font-medium">({compressionRatio}% compression achieved)</span>
							{/if}
						</p>
					</div>
				</div>
			</div>
		{:else if $outputFormat !== 'auto' && $outputLogs}
			<div class="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
				<div class="flex-shrink-0">
					<svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
					</svg>
				</div>
				<div class="ml-3">
					<p class="text-sm text-blue-800 dark:text-blue-200">
						<span class="font-medium">Format:</span> <span class="font-mono bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded text-xs">{getFormatDisplayName($outputFormat)}</span>
					</p>
				</div>
			</div>
		{/if}
	</div>

	<!-- Action Buttons -->
	<div class="flex gap-3 pt-2">
		<button
			type="button"
			on:click={handleFormat}
			disabled={!$inputLogs || $inputLogs.trim().length === 0}
			class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
		>
			<div class="flex items-center justify-center">
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
				</svg>
				<span>Transform Logs</span>
			</div>
		</button>

		<button 
			type="button" 
			on:click={handleClear} 
			class="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md"
		>
			<div class="flex items-center justify-center">
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
				</svg>
				<span>Clear All</span>
			</div>
		</button>
	</div>

	{#if $errorMessage}
		<div class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-2 rounded-md text-xs">
			<div class="flex items-center">
				<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
				</svg>
				<strong class="font-medium">Error:</strong>
				<span class="ml-2">{$errorMessage}</span>
			</div>
		</div>
	{/if}
</div>