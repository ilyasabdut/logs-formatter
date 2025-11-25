import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Get initial theme from localStorage or system preference
 */
function getInitialTheme() {
	if (!browser) return 'light';

	const stored = localStorage.getItem('theme');
	if (stored) return stored;

	// Check system preference
	if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
		return 'dark';
	}

	return 'light';
}

/**
 * Theme store with localStorage persistence
 */
function createThemeStore() {
	const { subscribe, set, update } = writable(getInitialTheme());

	return {
		subscribe,
		set: (value) => {
			if (browser) {
				localStorage.setItem('theme', value);
				// Update document class
				if (value === 'dark') {
					document.documentElement.classList.add('dark');
				} else {
					document.documentElement.classList.remove('dark');
				}
			}
			set(value);
		},
		toggle: () => {
			update((current) => {
				const newTheme = current === 'light' ? 'dark' : 'light';
				if (browser) {
					localStorage.setItem('theme', newTheme);
					// Update document class
					if (newTheme === 'dark') {
						document.documentElement.classList.add('dark');
					} else {
						document.documentElement.classList.remove('dark');
					}
				}
				return newTheme;
			});
		}
	};
}

export const theme = createThemeStore();
