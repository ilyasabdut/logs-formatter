<script>
	import { outputLogs, inputLogs } from '$lib/stores/app.js';
	import MetricsDisplay from '$lib/components/MetricsDisplay.svelte';

	let copyButtonText = 'Copy to Clipboard';
	let copyTimeout;

	/**
	 * Copy output to clipboard
	 */
	async function handleCopy() {
		if (!$outputLogs) return;

		try {
			await navigator.clipboard.writeText($outputLogs);
			copyButtonText = 'Copied!';

			if (copyTimeout) clearTimeout(copyTimeout);
			copyTimeout = setTimeout(() => {
				copyButtonText = 'Copy to Clipboard';
			}, 2000);
		} catch (error) {
			copyButtonText = 'Failed to copy';
			setTimeout(() => {
				copyButtonText = 'Copy to Clipboard';
			}, 2000);
		}
	}
</script>

<div class="relative">
	{#if $outputLogs}
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center space-x-2">
				<div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
				<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Formatted Output Ready</span>
			</div>
			<button
				type="button"
				on:click={handleCopy}
				class="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
				aria-label="Copy formatted output to clipboard"
			>
				{#if copyButtonText === 'Copied!'}
					<svg class="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
					</svg>
				{:else if copyButtonText === 'Failed to copy'}
					<svg class="w-4 h-4 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
					</svg>
				{:else}
					<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
					</svg>
				{/if}
				{copyButtonText}
			</button>
		</div>
	{/if}

	<div class="relative">
		<textarea
			value={$outputLogs}
			readonly
			placeholder="Formatted logs will appear here...

Features:
• Automatic format detection
• Smart compression optimization
• TOON format for LLMs
• Real-time statistics

Simply input your logs above and click 'Transform Logs' to see the optimized output here."
			class="w-full h-[450px] px-4 py-3 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg resize-none focus:ring-0 focus:outline-none cursor-text font-mono text-sm leading-relaxed transition-all duration-200"
			aria-label="Output logs textarea"
		/>
</div>

	<!-- Output Metrics with Compression Stats -->
	<div class="mt-4">
		<MetricsDisplay 
			inputText={$inputLogs}
			outputText={$outputLogs}
			position="output"
		/>
	</div>
</div>
