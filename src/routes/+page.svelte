<script>
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme.js';
	import Header from '$lib/components/Header.svelte';
	import InputArea from '$lib/components/InputArea.svelte';
	import ControlPanel from '$lib/components/ControlPanel.svelte';
	import OutputArea from '$lib/components/OutputArea.svelte';

	// Initialize theme on mount
	onMount(() => {
		if ($theme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	});
</script>

<svelte:head>
	<title>Log Formatter - Compact Logs for LLMs</title>
	<meta
		name="description"
		content="Fast, client-side log formatter that compacts various log formats for LLM consumption. Supports JSON, Apache/Nginx, Kubernetes, and plain text logs."
	/>
</svelte:head>

<div class="min-h-screen flex flex-col">
	<Header />

	<main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="space-y-6">
			<!-- Input Section -->
			<section aria-labelledby="input-section">
				<InputArea />
			</section>

			<!-- Control Panel -->
			<section aria-labelledby="control-section">
				<ControlPanel />
			</section>

			<!-- Output Section -->
			<section aria-labelledby="output-section">
				<OutputArea />
			</section>

			<!-- Info Section -->
			<section
				class="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
			>
				<h2 class="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
					How It Works
				</h2>
				<ul class="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
					<li>All processing happens in your browser - no data sent to servers</li>
					<li>Automatically detects log format or select manually</li>
					<li>Strips unnecessary whitespace and decorative characters</li>
					<li>Preserves semantic meaning while minimizing character count</li>
					<li>Perfect for pasting into LLM conversations with token limits</li>
				</ul>
			</section>
		</div>
	</main>

	<footer class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<p class="text-center text-sm text-gray-500 dark:text-gray-400">
				Built with SvelteKit and Tailwind CSS. All processing is client-side.
			</p>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
	}
</style>
