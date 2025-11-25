<script>
	import { inputLogs } from '$lib/stores/app.js';
	import MetricsDisplay from './MetricsDisplay.svelte';

	let isDragging = false;
	let fileInputElement;

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
	function handleDrop(event) {
		event.preventDefault();
		isDragging = false;

		const file = event.dataTransfer?.files?.[0];
		if (file) {
			readFile(file);
		}
	}

	function handleDragOver(event) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	/**
	 * Read file content
	 */
	function readFile(file) {
		const reader = new FileReader();
		reader.onload = (e) => {
			const content = e.target?.result;
			if (typeof content === 'string') {
				inputLogs.set(content);
			}
		};
		reader.readAsText(file);
	}

	/**
	 * Trigger file input click
	 */
	function triggerFileInput() {
		fileInputElement?.click();
	}
</script>

<div class="space-y-2">
	<div class="flex items-center justify-between">
		<label for="input-logs" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Input Logs</label>
		<button
			type="button"
			on:click={triggerFileInput}
			class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
		>
			Upload File
		</button>
		<input
			type="file"
			bind:this={fileInputElement}
			on:change={handleFileSelect}
			accept=".log,.txt,.json"
			class="hidden"
			aria-label="Upload log file"
		/>
	</div>

	<div
		class="relative"
		on:drop={handleDrop}
		on:dragover={handleDragOver}
		on:dragleave={handleDragLeave}
		role="region"
		aria-label="Input area with drag and drop support"
	>
		<textarea
			id="input-logs"
			bind:value={$inputLogs}
			placeholder="Paste your logs here or drag and drop a file...&#10;&#10;Supports: JSON, Apache/Nginx logs, Kubernetes describe output, and plain text"
			class="textarea-custom h-64"
			class:ring-2={isDragging}
			class:ring-blue-500={isDragging}
			class:dark:ring-blue-400={isDragging}
			class:border-blue-500={isDragging}
			class:dark:border-blue-400={isDragging}
			aria-label="Input logs textarea"
		/>
		{#if isDragging}
			<div
				class="absolute inset-0 bg-blue-50 dark:bg-blue-900 bg-opacity-90 dark:bg-opacity-30 border-2 border-dashed border-blue-500 dark:border-blue-400 rounded-lg flex items-center justify-center pointer-events-none"
			>
				<p class="text-blue-600 dark:text-blue-400 font-medium">Drop file here</p>
			</div>
		{/if}
	</div>

	<!-- Input Metrics -->
	<MetricsDisplay inputText={$inputLogs} position="input" />
</div>
