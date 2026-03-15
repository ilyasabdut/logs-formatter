/**
 * Background service worker for Chrome Extension
 * Opens the full-page app in a new tab when the extension icon is clicked
 */

chrome.action.onClicked.addListener(() => {
	chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});
