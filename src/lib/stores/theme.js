import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { getStorage, setStorage } from '$lib/utils/chromeStorage.js';

/**
 * Get initial theme from chrome.storage.local or system preference
 * Uses async storage with fallback for non-extension builds
 */
async function getInitialTheme() {
	if (!browser) return 'light';

	try {
		const stored = await getStorage('theme', null);
		if (stored) return stored;

		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		return prefersDark ? 'dark' : 'light';
	} catch (e) {
		console.warn('Unable to access storage for theme preference:', e);
		try {
			return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		} catch (mediaError) {
			return 'light';
		}
	}
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
 * Theme store with chrome.storage.local persistence
 * Falls back to localStorage for non-extension builds
 */
function createThemeStore() {
	// Start with light theme, will update asynchronously
	const { subscribe, set } = writable('light');

	// Initialize theme asynchronously
	if (browser) {
		getInitialTheme().then(initialTheme => {
			applyTheme(initialTheme);
			set(initialTheme);
		});
	}

	return {
		subscribe,
		set: async (value) => {
			if (browser) {
				try {
					await setStorage('theme', value);
				} catch (e) {
					console.warn('Unable to save theme preference:', e);
				}
				applyTheme(value);
			}
			set(value);
		},
		toggle: async () => {
			const current = get(theme);
			const newTheme = current === 'light' ? 'dark' : 'light';
			if (browser) {
				try {
					await setStorage('theme', newTheme);
				} catch (e) {
					console.warn('Unable to save theme preference:', e);
				}
				applyTheme(newTheme);
			}
			set(newTheme);
		}
	};
}

export const theme = createThemeStore();
