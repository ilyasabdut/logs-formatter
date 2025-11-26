import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Get initial theme from localStorage or system preference
 * Uses the same logic as the HTML script for consistency
 */
function getInitialTheme() {
	if (!browser) return 'light';

	const stored = localStorage.getItem('theme');
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	
	return stored || (prefersDark ? 'dark' : 'light');
}

/**
 * Apply theme to document immediately
 */
function applyTheme(themeValue) {
	if (!browser) return;
	
	if (themeValue === 'dark') {
		document.documentElement.classList.add('dark');
	} else {
		document.documentElement.classList.remove('dark');
	}
}

/**
 * Theme store with localStorage persistence
 */
function createThemeStore() {
	const initialTheme = getInitialTheme();
	
	// Apply theme immediately to prevent FOUC
	applyTheme(initialTheme);
	
	const { subscribe, set, update } = writable(initialTheme);

	return {
		subscribe,
		set: (value) => {
			if (browser) {
				localStorage.setItem('theme', value);
				// Update document class
				applyTheme(value);
			}
			set(value);
		},
		toggle: () => {
			update((current) => {
				const newTheme = current === 'light' ? 'dark' : 'light';
				if (browser) {
					localStorage.setItem('theme', newTheme);
					// Update document class
					applyTheme(newTheme);
				}
				return newTheme;
			});
		}
	};
}

export const theme = createThemeStore();
