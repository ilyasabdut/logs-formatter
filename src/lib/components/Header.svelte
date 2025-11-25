<script>
	import ThemeToggle from './ThemeToggle.svelte';
</script>

<header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Log Formatter</h1>
				<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
					Compact logs for LLM consumption - client-side processing
				</p>
			</div>
			<div class="flex items-center gap-4">
				<ThemeToggle />
				<div class="text-sm text-gray-400 dark:text-gray-500">v1.0.0</div>
			</div>
		</div>
	</div>
</header>
