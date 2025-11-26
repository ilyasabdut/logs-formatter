import { writable } from 'svelte/store';

// Input and output logs
export const inputLogs = writable('');
export const outputLogs = writable('');

// User selections
export const logType = writable('auto'); // 'auto', 'json', 'apache', 'nginx', 'kubernetes', 'plain'
export const outputFormat = writable('auto'); // 'auto', 'jsonlines', 'keyvalue', 'compact', 'toon'

// UI state
export const isProcessing = writable(false);
export const errorMessage = writable('');
