<script>
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme.js';
	import { inputLogs, outputLogs } from '$lib/stores/app.js';
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
	<section aria-labelledby="input-section" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
		<div class="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
			<h2 id="input-section" class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
				<div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
				Input Logs
			</h2>
		</div>
		<div class="p-6">
			<InputArea />
		</div>
	</section>

	<!-- Control Panel -->
	<section aria-labelledby="control-section" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
		<div class="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
			<h2 id="control-section" class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
				<div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
				Configuration
			</h2>
		</div>
		<div class="p-6">
			<ControlPanel />
		</div>
	</section>

	<!-- Output Section -->
	<section aria-labelledby="output-section" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
		<div class="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
			<div class="flex items-center justify-between">
				<h2 id="output-section" class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
					<div class="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
					Formatted Output
				</h2>
				{#if $outputLogs}
					<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800">
						<div class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
						Formatted
					</span>
				{/if}
			</div>
		</div>
		<div class="p-6">
			<OutputArea />
		</div>
	</section>

	<!-- Info Section -->
	<section class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-sm">
		<h2 class="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4 flex items-center">
			<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
			</svg>
			How It Works
		</h2>
		<ul class="text-sm text-blue-800 dark:text-blue-300 space-y-2">
			<li class="flex items-start">
				<div class="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
				<span>All processing happens in your browser - no data sent to servers</span>
			</li>
			<li class="flex items-start">
				<div class="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
				<span>Automatically detects log format or select manually</span>
			</li>
			<li class="flex items-start">
				<div class="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
				<span>Strips unnecessary whitespace and decorative characters</span>
			</li>
			<li class="flex items-start">
				<div class="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
				<span>Preserves semantic meaning while minimizing character count</span>
			</li>
			<li class="flex items-start">
				<div class="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
				<span>Perfect for pasting into LLM conversations with token limits</span>
			</li>
			<li class="flex items-start">
				<div class="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
				<span class="font-medium">Smart Auto Mode tests all formats and selects the best compression</span>
			</li>
		</ul>
	</section>
</div>
	</main>

	<footer class="border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				<!-- Brand Section -->
				<div class="md:col-span-2">
					<div class="flex items-center space-x-3 mb-4">
						<div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
							<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
							</svg>
						</div>
						<div>
							<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Log Formatter</h3>
							<p class="text-sm text-gray-600 dark:text-gray-400">LLM-Optimized Log Processing Platform</p>
						</div>
					</div>
					<p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
						Transform your logs into compact, AI-ready formats. All processing happens client-side for maximum privacy and performance.
					</p>
				</div>

				<!-- Features Section -->
				<div>
					<h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wide">Key Features</h4>
					<ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
						<li class="flex items-center">
							<div class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
							100% Client-Side Processing
						</li>
						<li class="flex items-center">
							<div class="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
							Smart Auto Format Detection
						</li>
						<li class="flex items-center">
							<div class="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
							TOON LLM Optimization
						</li>
						<li class="flex items-center">
							<div class="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
							Real-time Compression Analytics
						</li>
					</ul>
				</div>
			</div>

			<!-- Bottom Section -->
			<div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
				<div class="flex flex-col md:flex-row justify-between items-center">
					<div class="flex items-center space-x-6 text-xs text-gray-500 dark:text-gray-500">
						<span>© 2024 Log Formatter Platform</span>
						<span>•</span>
						<span>Built with SvelteKit & Tailwind CSS</span>
						<span>•</span>
						<span>Open Source Project</span>
					</div>
					<div class="flex items-center space-x-4 mt-4 md:mt-0">
						<div class="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
							<div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
							<span>Powered by Advanced AI</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
	}
</style>
