/**
 * Theme initialization script
 * Loads before the main app to prevent theme flash
 */
(function() {
	const isExtension = typeof chrome !== 'undefined' && chrome.storage;

	const applyTheme = (theme) => {
		if (theme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	};

	// Apply system preference IMMEDIATELY (synchronous)
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	applyTheme(prefersDark ? 'dark' : 'light');

	// Then try to get stored preference and update
	if (isExtension) {
		// Chrome extension: use chrome.storage.local (async)
		chrome.storage.local.get(['theme'], (result) => {
			const stored = result.theme;
			if (stored) {
				applyTheme(stored);
			}
		});
	} else {
		// Fallback to localStorage for non-extension builds
		try {
			const stored = localStorage.getItem('theme');
			if (stored) {
				applyTheme(stored);
			}
		} catch (e) {
			// System preference already applied above
		}
	}
})();
