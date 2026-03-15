/**
 * Chrome storage utility for extension theme persistence
 * Replaces localStorage for Chrome Extension compatibility
 */

const isChromeExtension = typeof chrome !== 'undefined' && chrome.storage;

/**
 * Get value from chrome.storage.local with fallback to localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {Promise<any>} Stored value or default
 */
export async function getStorage(key, defaultValue = null) {
	if (isChromeExtension) {
		return new Promise((resolve) => {
			chrome.storage.local.get([key], (result) => {
				resolve(result[key] !== undefined ? result[key] : defaultValue);
			});
		});
	}

	// Fallback to localStorage for non-extension builds
	try {
		const stored = localStorage.getItem(key);
		return stored !== null ? JSON.parse(stored) : defaultValue;
	} catch (e) {
		console.warn(`Unable to read ${key} from localStorage:`, e);
		return defaultValue;
	}
}

/**
 * Set value in chrome.storage.local with fallback to localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store (must be JSON-serializable)
 * @returns {Promise<void>}
 */
export async function setStorage(key, value) {
	if (isChromeExtension) {
		return new Promise((resolve) => {
			chrome.storage.local.set({ [key]: value }, () => {
				if (chrome.runtime.lastError) {
					console.warn(`Error storing ${key}:`, chrome.runtime.lastError);
				}
				resolve();
			});
		});
	}

	// Fallback to localStorage for non-extension builds
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (e) {
		console.warn(`Unable to save ${key} to localStorage:`, e);
	}
}

/**
 * Remove value from storage
 * @param {string} key - Storage key
 * @returns {Promise<void>}
 */
export async function removeStorage(key) {
	if (isChromeExtension) {
		return new Promise((resolve) => {
			chrome.storage.local.remove([key], () => {
				resolve();
			});
		});
	}

	try {
		localStorage.removeItem(key);
	} catch (e) {
		console.warn(`Unable to remove ${key} from localStorage:`, e);
	}
}
