<script>
	import { calculateMetrics, calculateCompression } from '$lib/utils/tokenEstimator.js';

	export let inputText = '';
	export let outputText = '';
	export let position = 'input'; // 'input' or 'output'

	$: inputMetrics = calculateMetrics(inputText);
	$: outputMetrics = calculateMetrics(outputText);
	$: compression = calculateCompression(inputMetrics, outputMetrics);
	$: currentMetrics = position === 'input' ? inputMetrics : outputMetrics;
</script>

{#if position === 'input'}
	<!-- Input Metrics -->
	<div class="grid grid-cols-3 gap-3">
		<div class="text-center p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg">
			<div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
				{currentMetrics.chars.toLocaleString()}
			</div>
			<div class="text-xs text-gray-500 dark:text-gray-400 font-medium">Characters</div>
		</div>
		<div class="text-center p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg">
			<div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
				{currentMetrics.tokens.toLocaleString()}
			</div>
			<div class="text-xs text-gray-500 dark:text-gray-400 font-medium">Est. Tokens</div>
		</div>
		<div class="text-center p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg">
			<div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
				{currentMetrics.lines.toLocaleString()}
			</div>
			<div class="text-xs text-gray-500 dark:text-gray-400 font-medium">Lines</div>
		</div>
	</div>
{:else}
	<!-- Output Metrics with Compression Stats -->
	<div class="space-y-3">
		<div class="grid grid-cols-3 gap-3">
			<div class="text-center p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg">
				<div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
					{currentMetrics.chars.toLocaleString()}
				</div>
				<div class="text-xs text-gray-500 dark:text-gray-400 font-medium">Characters</div>
			</div>
			<div class="text-center p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg">
				<div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
					{currentMetrics.tokens.toLocaleString()}
				</div>
				<div class="text-xs text-gray-500 dark:text-gray-400 font-medium">Est. Tokens</div>
			</div>
			<div class="text-center p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg">
				<div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
					{currentMetrics.lines.toLocaleString()}
				</div>
				<div class="text-xs text-gray-500 dark:text-gray-400 font-medium">Lines</div>
			</div>
		</div>

		{#if outputText && inputText}
			<!-- Compression Statistics -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<div class="text-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
					<div class="text-3xl font-bold text-green-600 dark:text-green-400">
						{compression.charReduction}%
					</div>
					<div class="text-sm text-green-700 dark:text-green-300 font-medium">
						Character Reduction
					</div>
					<div class="text-xs text-green-600 dark:text-green-400 mt-1">
						Saved {compression.charSaved.toLocaleString()} chars
					</div>
				</div>
				<div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
					<div class="text-3xl font-bold text-blue-600 dark:text-blue-400">
						{compression.tokenReduction}%
					</div>
					<div class="text-sm text-blue-700 dark:text-blue-300 font-medium">
						Token Reduction
					</div>
					<div class="text-xs text-blue-600 dark:text-blue-400 mt-1">
						Saved ~{compression.tokenSaved.toLocaleString()} tokens
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
