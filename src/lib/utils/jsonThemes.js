/**
 * JSON Syntax Highlighting Themes
 * Inspired by json-viewer Chrome extension
 */

export const themes = {
	default: {
		name: 'Default',
		colors: {
			string: 'text-green-600 dark:text-green-400',
			number: 'text-blue-600 dark:text-blue-400',
			boolean: 'text-orange-600 dark:text-orange-400',
			null: 'text-gray-500 dark:text-gray-400 italic',
			key: 'text-red-600 dark:text-red-400 font-mono',
			bracket: 'text-gray-600 dark:text-gray-400 font-mono',
			punctuation: 'text-gray-500',
			meta: 'text-purple-600 dark:text-purple-400',
			metaNested: 'text-blue-500 dark:text-blue-400',
			button: {
				base: 'cursor-pointer select-none text-left rounded px-1 py-0.5 -mx-1 transition-colors',
				hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
				showMore: 'text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded transition-colors'
			}
		},
		fonts: {
			mono: 'font-mono'
		}
	},

	monokai: {
		name: 'Monokai',
		colors: {
			string: 'text-[#a6e22e]',
			number: 'text-[#ae81ff]',
			boolean: 'text-[#fd971f]',
			null: 'text-[#f92672] italic',
			key: 'text-[#66d9ef] font-mono',
			bracket: 'text-[#f8f8f2] font-mono',
			punctuation: 'text-[#f8f8f2]',
			meta: 'text-[#e6db74]',
			metaNested: 'text-[#75715e]',
			button: {
				base: 'cursor-pointer select-none text-left rounded px-1 py-0.5 -mx-1 transition-colors',
				hover: 'hover:bg-[#49483e]',
				showMore: 'text-xs bg-[#75715e] hover:bg-[#6e7062] text-[#f8f8f2] px-2 py-1 rounded transition-colors'
			}
		},
		fonts: {
			mono: 'font-mono'
		}
	},

	dracula: {
		name: 'Dracula',
		colors: {
			string: 'text-[#50fa7b]',
			number: 'text-[#bd93f9]',
			boolean: 'text-[#ff79c6]',
			null: 'text-[#6272a4] italic',
			key: 'text-[#ff79c6] font-mono',
			bracket: 'text-[#f8f8f2] font-mono',
			punctuation: 'text-[#f8f8f2]',
			meta: 'text-[#f1fa8c]',
			metaNested: 'text-[#6272a4]',
			button: {
				base: 'cursor-pointer select-none text-left rounded px-1 py-0.5 -mx-1 transition-colors',
				hover: 'hover:bg-[#44475a]',
				showMore: 'text-xs bg-[#44475a] hover:bg-[#6272a4] text-[#f8f8f2] px-2 py-1 rounded transition-colors'
			}
		},
		fonts: {
			mono: 'font-mono'
		}
	},

	nord: {
		name: 'Nord',
		colors: {
			string: 'text-[#a3be8c]',
			number: 'text-[#b48ead]',
			boolean: 'text-[#81a1c1]',
			null: 'text-[#4c566a] italic',
			key: 'text-[#88c0d0] font-mono',
			bracket: 'text-[#d8dee9] font-mono',
			punctuation: 'text-[#d8dee9]',
			meta: 'text-[#ebcb8b]',
			metaNested: 'text-[#4c566a]',
			button: {
				base: 'cursor-pointer select-none text-left rounded px-1 py-0.5 -mx-1 transition-colors',
				hover: 'hover:bg-[#4c566a]',
				showMore: 'text-xs bg-[#4c566a] hover:bg-[#434c5e] text-[#d8dee9] px-2 py-1 rounded transition-colors'
			}
		},
		fonts: {
			mono: 'font-mono'
		}
	},

	github: {
		name: 'GitHub',
		colors: {
			string: 'text-[#032f62]',
			number: 'text-[#005cc5]',
			boolean: 'text-[#d73a49]',
			null: 'text-[#6f42c1] italic',
			key: 'text-[#24292e] font-mono',
			bracket: 'text-[#586069] font-mono',
			punctuation: 'text-[#586069]',
			meta: 'text-[#e36209]',
			metaNested: 'text-[#959da5]',
			button: {
				base: 'cursor-pointer select-none text-left rounded px-1 py-0.5 -mx-1 transition-colors',
				hover: 'hover:bg-[#f6f8fa]',
				showMore: 'text-xs bg-[#e1e4e8] hover:bg-[#d1d5da] text-[#032f62] px-2 py-1 rounded transition-colors'
			}
		},
		fonts: {
			mono: 'font-mono'
		}
	},

	solarized: {
		name: 'Solarized',
		colors: {
			string: 'text-[#859900]',
			number: 'text-[#2aa198]',
			boolean: 'text-[#cb4b16]',
			null: 'text-[#6c71c4] italic',
			key: 'text-[#268bd2] font-mono',
			bracket: 'text-[#839496] font-mono',
			punctuation: 'text-[#839496]',
			meta: 'text-[#b58900]',
			metaNested: 'text-[#586e75]',
			button: {
				base: 'cursor-pointer select-none text-left rounded px-1 py-0.5 -mx-1 transition-colors',
				hover: 'hover:bg-[#fdf6e3]',
				showMore: 'text-xs bg-[#eee8d5] hover:bg-[#fdf6e3] text-[#657b83] px-2 py-1 rounded transition-colors'
			}
		},
		fonts: {
			mono: 'font-mono'
		}
	},

	atomOne: {
		name: 'Atom One',
		colors: {
			string: 'text-[#98c379]',
			number: 'text-[#d19a66]',
			boolean: 'text-[#56b6c2]',
			null: 'text-[#e06c75] italic',
			key: 'text-[#e06c75] font-mono',
			bracket: 'text-[#abb2bf] font-mono',
			punctuation: 'text-[#abb2bf]',
			meta: 'text-[#d19a66]',
			metaNested: 'text-[#5c6370]',
			button: {
				base: 'cursor-pointer select-none text-left rounded px-1 py-0.5 -mx-1 transition-colors',
				hover: 'hover:bg-[#282c34]',
				showMore: 'text-xs bg-[#5c6370] hover:bg-[#4b5263] text-[#abb2bf] px-2 py-1 rounded transition-colors'
			}
		},
		fonts: {
			mono: 'font-mono'
		}
	},

	vscode: {
		name: 'VS Code',
		colors: {
			string: 'text-[#ce9178]',
			number: 'text-[#b5cea8]',
			boolean: 'text-[#569cd6]',
			null: 'text-[#4ec9b0] italic',
			key: 'text-[#9cdcfe] font-mono',
			bracket: 'text-[#d4d4d4] font-mono',
			punctuation: 'text-[#d4d4d4]',
			meta: 'text-[#dcdcaa]',
			metaNested: 'text-[#6a9955]',
			button: {
				base: 'cursor-pointer select-none text-left rounded px-1 py-0.5 -mx-1 transition-colors',
				hover: 'hover:bg-[#2a2d2e]',
				showMore: 'text-xs bg-[#3c3c3c] hover:bg-[#4a4a4a] text-[#cccccc] px-2 py-1 rounded transition-colors'
			}
		},
		fonts: {
			mono: 'font-mono'
		}
	}
};

/**
 * Get theme by name, fallback to default
 */
export function getTheme(themeName) {
	return themes[themeName] || themes.default;
}

/**
 * Get all theme names
 */
export function getThemeNames() {
	return Object.keys(themes);
}

/**
 * Default theme export for backward compatibility
 */
export const theme = themes.default;
