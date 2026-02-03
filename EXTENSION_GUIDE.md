# Logs Formatter Extension - Build & Usage Guide

A step-by-step guide to build and install the Logs Formatter browser extension for Brave and Chrome.

---

## Prerequisites

- Node.js 18+ and npm
- Brave or Google Chrome browser

---

## Step 1: Build the Extension

### Install Dependencies

```bash
npm install
```

### Build for Production

```bash
npm run build
```

This creates a `build/` folder containing:
- `manifest.json` - Extension manifest (Manifest V3)
- `index.html` - Main popup page
- `favicon.png` - Extension icon
- `_app/` - JavaScript and CSS bundles

**Build output example:**
```
build/
├── manifest.json
├── index.html
├── favicon.png
└── _app/
    ├── immutable/
    └── ...
```

---

## Step 2: Install in Brave/Chrome

### Open Extensions Page

1. Open your browser
2. Navigate to `chrome://extensions`

### Enable Developer Mode

1. Toggle **Developer mode** ON (top-right corner)
   ![Developer mode toggle](https://developer.chrome.com/static/docs/extensions/mv3/get-started/extensions-page-dev-mode.png)

### Load the Extension

1. Click **"Load unpacked"** button (top-left)
2. File picker opens - navigate to this project
3. Select the `build/` folder
4. Click **"Select"** (macOS) or **"Open"** (Windows)

### Verify Installation

The extension appears in your list with:
- Name: "Logs Formatter"
- Version: 1.0.0
- ID: Generated extension ID

---

## Step 3: Use the Extension

### Open the Popup

1. Look for the extension icon in your toolbar
   - If not visible, click the puzzle piece icon → pin Logs Formatter
2. Click the extension icon to open the popup

### Format Logs

1. **Paste logs** in the input textarea
   - Or drag & drop a log file
   - Or click "Choose File" to upload

2. **Select format** (or use Auto):
   - Auto (Best Compression) - Recommended
   - TOON (LLM-Optimized)
   - JSON Lines
   - Key-Value Lines
   - Compact JSON

3. **Click "Format Logs"** button

4. **View results**:
   - Formatted output appears below
   - Compression stats show reduction %
   - Auto mode shows which format was selected

5. **Copy output**:
   - Click "Copy to Clipboard"
   - Or select and copy manually

---

## Supported Log Formats

### JSON / JSON Lines
```json
{"level":"info","msg":"Request processed","duration":123}
{"level":"error","msg":"Database connection failed"}
```

### Apache/Nginx Logs
```
192.168.1.1 - - [10/Oct/2000:13:55:36 -0700] "GET /index.html HTTP/1.1" 200 2326
```

### Kubernetes Describe
```
Name:         my-pod
Namespace:    default
Status:       Running
```

### Plain Text
```
2024-01-01 10:00:00 INFO Processing request id=123
```

---

## Troubleshooting

### Extension Not Loading

**Error: "Manifest file is missing or unreadable"**
- Ensure you selected the `build/` folder, not the project root
- Check that `build/manifest.json` exists

**Error: "Could not load icon"**
- Verify `build/favicon.png` exists
- Icon should be 128x128 pixels

### UI Not Displaying

**Blank popup:**
- Check browser console for JavaScript errors
- Ensure build completed successfully
- Try rebuilding: `npm run build`

### CSP Violations

If you see CSP errors in console:
- The Umami analytics script has been removed (already done)
- Extension only uses local resources

---

## Rebuilding After Changes

If you modify the source code:

```bash
npm run build
```

Then reload the extension:
1. Go to `chrome://extensions`
2. Find "Logs Formatter"
3. Click the 🔄 reload icon
4. Or click "Remove" and load unpacked again

---

## Development Mode

For active development with hot reload:

```bash
npm run dev
```

This starts a dev server at `http://localhost:5173`, but for extension testing, you need to build and load unpacked each time.

---

## Publishing (Optional)

To publish to Chrome Web Store:

1. Build production version: `npm run build`
2. Zip the `build/` folder: `zip -r logs-formatter.zip build/`
3. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
4. Click "New Item" and upload the zip
5. Fill in store listing details
6. Submit for review

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run build` | Build extension |
| `npm run dev` | Start dev server |
| `npm run preview` | Preview production build |

---

## Extension Files

| File | Purpose |
|------|---------|
| `static/manifest.json` | Extension configuration |
| `src/app.html` | HTML template (no external scripts) |
| `svelte.config.js` | Build configuration with fallback |
| `build/` | Output folder to load in browser |

---

**Extension ID:** Generated on install (unique per browser)  
**Manifest Version:** 3 (compatible with Chrome 88+, Brave 1.20+)  
**Size:** ~150KB (JavaScript + CSS + HTML)

Happy formatting! 🚀
