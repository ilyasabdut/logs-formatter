<script>
	import { outputLogs, inputLogs } from '$lib/stores/app.js';
	import MetricsDisplay from './MetricsDisplay.svelte';

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

<div class="space-y-2">
	<div class="flex items-center justify-between">
		<label for="output-logs" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
			Formatted Output
		</label>
		{#if $outputLogs}
			<button
				type="button"
				on:click={handleCopy}
				class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
				aria-label="Copy formatted output to clipboard"
			>
				{copyButtonText}
			</button>
		{/if}
	</div>

	<textarea
		id="output-logs"
		value={$outputLogs}
		readonly
		placeholder="Formatted logs will appear here..."
		class="textarea-custom h-64 bg-gray-50 dark:bg-gray-900"
		aria-label="Output logs textarea"
	/>

	<!-- Output Metrics with Compression Stats -->
	<MetricsDisplay inputText={$inputLogs} outputText={$outputLogs} position="output" />
</div>
