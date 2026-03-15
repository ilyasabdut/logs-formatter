import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { getStorage, setStorage } from '$lib/utils/chromeStorage.js';
import { themes, getTheme } from '$lib/utils/jsonThemes.js';

/**
 * Get initial JSON theme from chrome.storage.local
 */
async function getInitialJsonTheme() {
	if (!browser) return 'default';

	try {
		const stored = await getStorage('jsonTheme', null);
		return stored || 'default';
	} catch (e) {
		console.warn('Unable to access storage for JSON theme preference:', e);
		return 'default';
	}
}

/**
 * JSON theme store with chrome.storage.local persistence
 */
function createJsonThemeStore() {
	// Start with default theme
	const { subscribe, set } = writable('default');

	// Initialize theme asynchronously
	if (browser) {
		getInitialJsonTheme().then(initialTheme => {
			set(initialTheme);
		});
	}

	return {
		subscribe,
		set: async (value) => {
			if (browser) {
				try {
					await setStorage('jsonTheme', value);
				} catch (e) {
					console.warn('Unable to save JSON theme preference:', e);
				}
			}
			set(value);
		},
		getCurrentTheme: () => {
			return getTheme(get(jsonThemeStore));
		}
	};
}

export const jsonThemeStore = createJsonThemeStore();
export { themes, getTheme };
