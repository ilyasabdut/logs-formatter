<script>
	import { jsonThemeStore, themes } from '$lib/stores/jsonTheme.js';

	let isOpen = false;
	const themeNames = Object.keys(themes);

	function selectTheme(themeName) {
		jsonThemeStore.set(themeName);
		isOpen = false;
	}

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event) {
		if (!event.target.closest('.theme-dropdown')) {
			isOpen = false;
		}
	}

	// Get current theme display name
	$: currentThemeName = $jsonThemeStore;
	$: currentThemeDisplay = themes[currentThemeName]?.name || 'Default';
</script>

<svelte:window on:click={handleClickOutside} />

<div class="theme-dropdown relative">
	<button
		type="button"
		on:click={toggleDropdown}
		class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
		aria-label="Select JSON theme"
		aria-expanded={isOpen}
	>
		<svg class="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
		</svg>
		{currentThemeDisplay}
		<svg class="w-4 h-4 ml-2 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
		</svg>
	</button>

	{#if isOpen}
		<div
			class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
			role="menu"
		>
			<div class="py-1">
				{#each themeNames as themeName}
					{@const theme = themes[themeName]}
					<button
						type="button"
						on:click={() => selectTheme(themeName)}
						class="w-full text-left px-4 py-2 text-sm {currentThemeName === themeName
							? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium'
							: 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'} transition-colors"
						role="menuitem"
					>
						<div class="flex items-center justify-between">
							<span>{theme.name}</span>
							{#if currentThemeName === themeName}
								<svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
								</svg>
							{/if}
						</div>
						<!-- Color preview -->
						<div class="flex gap-1 mt-1">
							<div class="w-3 h-3 rounded {theme.colors.string.split(' ')[0]}" style="background-color: currentColor;" title="String"></div>
							<div class="w-3 h-3 rounded {theme.colors.number.split(' ')[0]}" style="background-color: currentcolor;" title="Number"></div>
							<div class="w-3 h-3 rounded {theme.colors.boolean.split(' ')[0]}" style="background-color: currentcolor;" title="Boolean"></div>
							<div class="w-3 h-3 rounded {theme.colors.key.split(' ')[0]}" style="background-color: currentcolor;" title="Key"></div>
						</div>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
