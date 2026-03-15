# Chrome Extension New Tab Override Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing SvelteKit log formatter into a Chrome extension that overrides the new tab page, providing instant access to log formatting capabilities.

**Architecture:** The project already uses `sveltekit-adapter-chrome-extension`. We will extend this by adding `chrome_url_overrides` for the new tab page and migrating from `localStorage` to `chrome.storage.local` for theme persistence across extension contexts. The app remains 100% client-side with no SSR dependencies.

**Tech Stack:** SvelteKit 2, Svelte 4, sveltekit-adapter-chrome-extension 2, Chrome Extension Manifest V3, Vite 5, Tailwind CSS 3, Bun (runtime)

---

## File Structure

```
logs-formatter/
├── src/
│   ├── lib/
│   │   ├── stores/
│   │   │   ├── theme.js          # MODIFY: Replace localStorage with chrome.storage.local
│   │   │   └── app.js            # KEEP: No changes needed
│   │   ├── components/           # KEEP: All components work as-is
│   │   ├── parsers/              # KEEP: All parsers work as-is
│   │   └── utils/                # KEEP: All utilities work as-is
│   ├── routes/
│   │   ├── +page.svelte          # KEEP: Main app page
│   │   ├── +layout.svelte        # KEEP: App layout
│   │   └── +page.js              # KEEP: Page load logic
│   └── app.html                  # MODIFY: Add chrome.storage.local theme script
├── static/
│   ├── manifest.json             # MODIFY: Add chrome_url_overrides.newtab
│   └── favicon.png               # KEEP: Extension icon
├── svelte.config.js              # KEEP: Already configured with chrome extension adapter
├── vite.config.js                # MODIFY: Update output config for extension compatibility
├── package.json                  # MODIFY: Add PWA plugin for offline support
└── docs/
    └── superpowers/
        └── plans/
            └── 2026-03-15-chrome-extension-new-tab.md  # This file
```

---

## Chunk 1: Foundation — Manifest and Build Configuration

### Task 1.1: Add chrome_url_overrides to manifest.json

**Files:**
- Modify: `static/manifest.json`

- [ ] **Step 1: Read current manifest.json**

```bash
cat static/manifest.json
```

- [ ] **Step 2: Add chrome_url_overrides to manifest**

```json
{
	"manifest_version": 3,
	"name": "Logs Formatter",
	"version": "1.0.0",
	"description": "Privacy-first log formatter and optimizer.",
	"action": {
		"default_popup": "index.html",
		"default_icon": "favicon.png"
	},
	"chrome_url_overrides": {
		"newtab": "index.html"
	},
	"icons": {
		"128": "favicon.png"
	},
	"permissions": ["storage"]
}
```

Run: `cat static/manifest.json`
Expected: JSON with `chrome_url_overrides.newtab` and `permissions: ["storage"]`

- [ ] **Step 3: Validate manifest.json syntax**

```bash
bun x svix validator static/manifest.json 2>&1 || echo "Using node to validate JSON"
node -e "JSON.parse(require('fs').readFileSync('static/manifest.json', 'utf8')); console.log('Valid JSON')"
```

Expected: No syntax errors

- [ ] **Step 4: Commit manifest changes**

```bash
git add static/manifest.json
git commit -m "feat(extension): add new tab override and storage permissions"
```

---

### Task 1.2: Update vite.config.js for extension compatibility

**Files:**
- Modify: `vite.config.js`

- [ ] **Step 1: Write failing test (manual verification)**

The test will be: after building, the output should have all assets bundled correctly without external dependencies.

Run: `cat vite.config.js`
Expected: See current minimal config with only `sveltekit()` plugin

- [ ] **Step 2: Update vite.config.js with extension-specific settings**

```javascript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// Extension-specific build settings
	build: {
		// Ensure no external dependencies are bundled
		rollupOptions: {
			output: {
				// Keep asset hashes consistent for extension updates
				assetFileNames: 'assets/[name].[hash][extname]',
				chunkFileNames: 'assets/[name].[hash].js',
				entryFileNames: 'assets/[name].[hash].js'
			}
		}
	}
});
```

Run: `cat vite.config.js`
Expected: Config includes build.rollupOptions.output settings

- [ ] **Step 3: Verify build still works**

```bash
bun run build 2>&1 | head -20
```

Expected: Build completes successfully without errors

- [ ] **Step 4: Verify build output structure**

```bash
ls -la build/
```

Expected: `build/` contains `index.html`, `manifest.json`, `favicon.png`, `assets/` folder

- [ ] **Step 5: Commit vite config changes**

```bash
git add vite.config.js
git commit -m "config: add extension-specific build output settings"
```

---

## Chunk 2: Storage Migration — localStorage to chrome.storage.local

### Task 2.1: Create chrome storage utility module

**Files:**
- Create: `src/lib/utils/chromeStorage.js`

- [ ] **Step 1: Write the chrome storage utility**

Create `src/lib/utils/chromeStorage.js`:

```javascript
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
```

Run: `cat src/lib/utils/chromeStorage.js`
Expected: File exists with exported functions

- [ ] **Step 2: Commit storage utility**

```bash
git add src/lib/utils/chromeStorage.js
git commit -m "feat(utils): add chrome.storage utility with localStorage fallback"
```

---

### Task 2.2: Refactor theme store to use chrome.storage.local

**Files:**
- Modify: `src/lib/stores/theme.js`

- [ ] **Step 1: Read current theme store**

```bash
cat src/lib/stores/theme.js
```

Expected: Current implementation using `localStorage.getItem` and `localStorage.setItem`

- [ ] **Step 2: Replace theme store with chrome.storage version**

Replace entire content of `src/lib/stores/theme.js` with:

```javascript
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
	const { subscribe, set, update } = writable('light');

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
```

Run: `cat src/lib/stores/theme.js`
Expected: New implementation imports `getStorage`, `setStorage` and uses async functions

- [ ] **Step 3: Verify no syntax errors**

```bash
bun --eval "import('./src/lib/stores/theme.js').then(() => console.log('Theme store loads OK'))"
```

Expected: No import or syntax errors

- [ ] **Step 4: Commit theme store refactor**

```bash
git add src/lib/stores/theme.js
git commit -m "refactor(theme): migrate from localStorage to chrome.storage.local"
```

---

### Task 2.3: Update app.html theme initialization script

**Files:**
- Modify: `src/app.html`

- [ ] **Step 1: Read current app.html**

```bash
cat src/app.html
```

Expected: Contains inline script using `localStorage.getItem('theme')`

- [ ] **Step 2: Replace theme initialization with chrome.storage version**

Replace the inline script in `<head>` (lines 9-21) with:

```html
		<!-- Prevent theme flash by setting initial theme before app loads -->
		<script>
			(function() {
				const isExtension = typeof chrome !== 'undefined' && chrome.storage;

				const applyTheme = (theme) => {
					if (theme === 'dark') {
						document.documentElement.classList.add('dark');
					} else {
						document.documentElement.classList.remove('dark');
					}
				};

				if (isExtension) {
					// Chrome extension: use chrome.storage.local
					chrome.storage.local.get(['theme'], (result) => {
						const stored = result.theme;
						if (stored) {
							applyTheme(stored);
						} else {
							const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
							applyTheme(prefersDark ? 'dark' : 'light');
						}
					});
				} else {
					// Fallback to localStorage for non-extension builds
					try {
						const stored = localStorage.getItem('theme');
						const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
						const theme = stored || (prefersDark ? 'dark' : 'light');
						applyTheme(theme);
					} catch (e) {
						const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
						applyTheme(prefersDark ? 'dark' : 'light');
					}
				}
			})();
		</script>
```

Run: `grep -A 30 "Prevent theme flash" src/app.html`
Expected: Updated script checks for `chrome.storage` and uses appropriate storage

- [ ] **Step 3: Verify app.html is valid HTML**

```bash
bun --eval "const fs = require('fs'); const content = fs.readFileSync('src/app.html', 'utf8'); console.log('HTML is valid:', content.includes('</html>') && content.includes('<!doctype'))"
```

Expected: `HTML is valid: true`

- [ ] **Step 4: Commit app.html changes**

```bash
git add src/app.html
git commit -m "feat(app): add chrome.storage.local support to theme initialization"
```

---

## Chunk 3: PWA Configuration for Offline Support

### Task 3.1: Install vite-plugin-pwa

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install PWA plugin**

```bash
bun add -D vite-plugin-pwa workbox-window
```

Expected: Packages added to `devDependencies`

- [ ] **Step 2: Verify installation**

```bash
grep -A 5 "devDependencies" package.json | grep -E "(vite-plugin-pwa|workbox-window)"
```

Expected: Both packages listed in devDependencies

- [ ] **Step 3: Commit package.json**

```bash
git add package.json bun.lockb
git commit -m "deps: add vite-plugin-pwa for offline support"
```

---

### Task 3.2: Configure PWA plugin in vite.config.js

**Files:**
- Modify: `vite.config.js`

- [ ] **Step 1: Add PWA plugin to vite config**

Update `vite.config.js` to:

```javascript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.png'],
			manifest: {
				name: 'Logs Formatter',
				short_name: 'LogFormatter',
				description: 'Privacy-first log formatter and optimizer.',
				theme_color: '#3b82f6',
				background_color: '#ffffff',
				display: 'standalone',
				icons: [
					{
						src: 'favicon.png',
						sizes: '128x128',
						type: 'image/png'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts',
							expiration: {
								maxEntries: 4,
								maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
							}
						}
					}
				]
			}
		})
	],
	build: {
		rollupOptions: {
			output: {
				assetFileNames: 'assets/[name].[hash][extname]',
				chunkFileNames: 'assets/[name].[hash].js',
				entryFileNames: 'assets/[name].[hash].js'
			}
		}
	}
});
```

Run: `cat vite.config.js`
Expected: Config includes `VitePWA` plugin with workbox configuration

- [ ] **Step 2: Verify build includes service worker**

```bash
bun run build 2>&1 | tail -20
ls -la build/ | grep -E "(sw|service-worker)"
```

Expected: Build completes and `build/` contains service worker files

- [ ] **Step 3: Commit PWA configuration**

```bash
git add vite.config.js
git commit -m "feat(pwa): configure offline support with service worker"
```

---

## Chunk 4: CSP Compliance Audit

### Task 4.1: Audit @toon-format/toon for CSP compliance

**Files:**
- Audit: `node_modules/@toon-format/toon/dist/*`

- [ ] **Step 1: Search for eval or Function constructor in toon bundle**

```bash
grep -r "eval\|new Function\|setTimeout(.*string\|setInterval(.*string" node_modules/@toon-format/toon/dist/ 2>/dev/null || echo "No matches found"
```

Expected: Either no matches (safe) or list of files using dynamic code (requires action)

- [ ] **Step 2: If CSP violations found, document findings**

If violations found in Step 1, create `docs/CSP_AUDIT.md`:

```markdown
# CSP Audit Findings

## @toon-format/toon

### Violations Found
- [List files and line numbers with eval/new Function]

### Resolution Options
1. Fork and patch the library
2. Use bundled-inline variant
3. Alternative: Replace with CSP-compliant library

### Decision
[Document chosen approach and rationale]
```

- [ ] **Step 3: Verify no inline scripts in build output**

```bash
bun run build
grep -r "javascript:" build/ 2>/dev/null | head -5 || echo "No inline javascript: URLs found"
grep -r "on\w\+=" build/ 2>/dev/null | head -5 || echo "No inline event handlers found"
```

Expected: No inline scripts or event handlers in build output

- [ ] **Step 4: Commit audit documentation (if issues found)**

```bash
# Only run if CSP_AUDIT.md was created
git add docs/CSP_AUDIT.md
git commit -m "docs: add CSP audit findings and resolution plan"
```

---

## Chunk 5: Extension Build and Testing

### Task 5.1: Build extension for local testing

**Files:**
- Build: `build/` directory

- [ ] **Step 1: Clean previous build**

```bash
rm -rf build/ .svelte-kit/
```

Expected: Directories removed

- [ ] **Step 2: Build extension**

```bash
bun run build
```

Expected: Build completes without errors

- [ ] **Step 3: Verify build output structure**

```bash
ls -la build/
cat build/manifest.json
```

Expected: `build/` contains `manifest.json` with `chrome_url_overrides` and `permissions`

- [ ] **Step 4: Check for external dependencies**

```bash
grep -r "http" build/index.html | head -5 || echo "No external HTTP references"
```

Expected: No external HTTP references (CDNs, etc.)

- [ ] **Step 5: Verify all assets are bundled**

```bash
find build/ -name "*.js" -o -name "*.css" | wc -l
```

Expected: Multiple JS and CSS files present

---

### Task 5.2: Manual testing checklist

**Files:**
- Manual test: Chrome browser with extension loaded

- [ ] **Step 1: Load extension in Chrome**

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `build/` directory

Expected: Extension loads without errors

- [ ] **Step 2: Test new tab override**

1. Open a new tab (Ctrl/Cmd + T)

Expected: Log Formatter app appears in new tab

- [ ] **Step 3: Test theme persistence**

1. Toggle theme to dark
2. Close tab
3. Open new tab

Expected: Dark theme persists

- [ ] **Step 4: Test log formatting**

1. Paste sample JSON logs
2. Select "Auto" format
3. Click "Format Logs"

Expected: Logs are formatted correctly

- [ ] **Step 5: Test offline functionality**

1. Disable network (Chrome DevTools > Network > Offline)
2. Refresh extension page

Expected: App loads and functions without network

---

## Chunk 6: Documentation and Packaging

### Task 6.1: Update README with extension instructions

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add extension installation section**

Append to `README.md`:

```markdown
## Chrome Extension Installation

### Load Unpacked (Development)

1. Run `bun run build`
2. Open `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the `build/` directory

The extension will now override your new tab page with Log Formatter.

### Build for Distribution

```bash
bun run build
cd build && zip -r ../logs-formatter-extension.zip .
```

Upload `logs-formatter-extension.zip` to the Chrome Web Store.
```

Run: `tail -30 README.md`
Expected: README ends with new extension installation section

- [ ] **Step 2: Commit README updates**

```bash
git add README.md
git commit -m "docs: add Chrome extension installation instructions"
```

---

### Task 6.2: Create extension packaging script

**Files:**
- Create: `scripts/package-extension.sh`

- [ ] **Step 1: Create packaging script**

Create `scripts/package-extension.sh`:

```bash
#!/bin/bash
set -e

VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
OUTPUT="logs-formatter-extension-v${VERSION}.zip"

echo "Building extension v${VERSION}..."
bun run build

echo "Packaging extension..."
cd build
zip -r "../${OUTPUT}" .
cd ..

echo "Extension packaged: ${OUTPUT}"
ls -lh "${OUTPUT}"
```

Run: `chmod +x scripts/package-extension.sh && cat scripts/package-extension.sh`
Expected: Script is executable and contains packaging logic

- [ ] **Step 2: Test packaging script**

```bash
./scripts/package-extension.sh
```

Expected: Extension zip file created in root directory

- [ ] **Step 3: Commit packaging script**

```bash
git add scripts/package-extension.sh
git commit -m "feat(scripts): add extension packaging script"
```

---

## Verification Steps (End-to-End)

### Task 7.1: Full end-to-end verification

**Files:**
- Test: Complete extension build and load cycle

- [ ] **Step 1: Clean build**

```bash
rm -rf build/ .svelte-kit/
bun run build
```

Expected: Clean build completes

- [ ] **Step 2: Verify manifest.json is valid**

```bash
cat build/manifest.json | jq . > /dev/null 2>&1 && echo "Manifest is valid JSON" || echo "Manifest has errors"
```

Expected: "Manifest is valid JSON"

- [ ] **Step 3: Verify all required files present**

```bash
ls -1 build/ | grep -E "^(manifest\.json|index\.html|favicon\.png)$"
```

Expected: All three files listed

- [ ] **Step 4: Verify storage permissions**

```bash
grep -A 5 "permissions" build/manifest.json
```

Expected: `permissions: ["storage"]` in manifest

- [ ] **Step 5: Verify newtab override**

```bash
grep -A 3 "chrome_url_overrides" build/manifest.json
```

Expected: `chrome_url_overrides.newtab: "index.html"` in manifest

---

### Task 7.2: Browser testing verification

**Files:**
- Manual test: Chrome Extension

- [ ] **Step 1: Load and test extension**

Run complete manual test from Task 5.2

- [ ] **Step 2: Verify theme persists across sessions**

1. Set theme to dark
2. Close Chrome completely
3. Reopen Chrome and open new tab

Expected: Dark theme is remembered

- [ ] **Step 3: Verify no console errors**

Open Chrome DevTools Console on extension page

Expected: No errors or warnings

---

## Rollback Plan

If any task fails:

1. **Theme store breaks**: Revert to previous `theme.js` from git
   ```bash
   git checkout HEAD~1 src/lib/stores/theme.js
   ```

2. **Build fails**: Revert vite.config.js changes
   ```bash
   git checkout HEAD~1 vite.config.js
   ```

3. **Extension won't load**: Check `chrome://extensions/` for specific error messages

4. **CSP violations**: Review `docs/CSP_AUDIT.md` and apply documented resolution

---

## Notes for Developers

- **Why chrome.storage.local instead of localStorage**: Extensions run in isolated contexts; chrome.storage.local persists across all extension contexts including background scripts, popups, and content scripts
- **Async storage**: All chrome.storage APIs are async; theme store now initializes asynchronously but handles this gracefully
- **CSP is strict**: MV3 extensions have `script-src 'self'` enforced - no inline scripts, no eval, no dynamically loaded code
- **Testing**: Use `chrome://extensions/` → "Load unpacked" for rapid iteration during development
- **Distribution**: Package with `scripts/package-extension.sh` and upload to Chrome Web Store Developer Dashboard
