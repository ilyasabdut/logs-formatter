<script>
	import { inputLogs } from '$lib/stores/app.js';
	import MetricsDisplay from '$lib/components/MetricsDisplay.svelte';

	let isDragging = false;
	let fileInputElement;
	let placeholderText = `Paste your logs here...

Supported formats:
• JSON / JSON Lines
• Apache/Nginx access logs  
• Kubernetes describe output
• Plain text logs

Drag and drop files or use the upload button above.`;

	/**
	 * Handle file upload via input element
	 */
	function handleFileSelect(event) {
		const file = event.target.files?.[0];
		if (file) {
			readFile(file);
		}
	}

	/**
	 * Handle drag and drop
	 */
	function handleDragOver(event) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(event) {
		event.preventDefault();
		isDragging = false;
	}

	function handleDrop(event) {
		event.preventDefault();
		isDragging = false;

		const files = event.dataTransfer.files;
		if (files.length > 0) {
			readFile(files[0]);
		}
	}

	/**
	 * Read file content
	 */
	function readFile(file) {
		if (file.type === 'text/plain' || file.type === 'application/json') {
			const reader = new FileReader();
			reader.onload = (e) => {
				inputLogs.set(e.target.result);
			};
			reader.readAsText(file);
		} else {
			alert('Please select a text or JSON file.');
		}
	}

	/**
	 * Handle file input click
	 */
	function triggerFileInput() {
		fileInputElement.click();
	}
</script>

<div class="relative">
	<!-- Upload Controls -->
	<div class="flex items-center justify-between mb-4">
		<div class="text-sm text-gray-600 dark:text-gray-400 flex items-center">
			<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
			</svg>
			Upload or paste your logs
		</div>
		
		<input
			bind:this={fileInputElement}
			on:change={handleFileSelect}
			type="file"
			accept=".txt,.log,.json"
			class="hidden"
		/>

		<button
			type="button"
			on:click={triggerFileInput}
			class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
		>
			<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
			</svg>
			Upload File
		</button>
	</div>

	<div
		role="region"
		aria-label="Input area with drag and drop support"
		class="relative border-2 border-dashed rounded-lg transition-all duration-200 {isDragging
			? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
			: 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}"
		on:dragover={handleDragOver}
		on:dragleave={handleDragLeave}
		on:drop={handleDrop}
	>
		<textarea
			bind:value={$inputLogs}
			placeholder={placeholderText}
			class="w-full h-[450px] px-4 py-3 border-0 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg resize-none focus:ring-0 focus:outline-none transition-all duration-200 font-mono text-sm leading-relaxed"
			aria-describedby="input-help"
		/>
	</div>

	<!-- Input Metrics -->
	<div class="mt-4">
		<MetricsDisplay 
			inputText={$inputLogs}
			outputText=""
			position="input"
		/>
	</div>

	{#if !$inputLogs}
		<div class="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
			<div class="text-center text-gray-400 dark:text-gray-500">
				<svg class="mx-auto h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
				</svg>
				<p class="text-sm text-gray-500 dark:text-gray-400">Tip: Automatically detects log formats and optimizes for LLM consumption</p>
			</div>
		</div>
	{/if}
</div>