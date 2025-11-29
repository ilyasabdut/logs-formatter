<script>
	export let data = null;
	export let keyName = null;
	export let level = 0;

	let isExpanded = true;
	let hasChildren = false;

	// Check if data has children (objects or arrays)
	$: {
		hasChildren = data && typeof data === 'object' &&
			((Array.isArray(data) && data.length > 0) ||
			(!Array.isArray(data) && Object.keys(data).length > 0));
	}

	// Auto-expand objects with few children, collapse large ones
	$: {
		if (hasChildren) {
			if (Array.isArray(data)) {
				isExpanded = data.length <= 3;
			} else {
				isExpanded = Object.keys(data).length <= 3;
			}
		}
	}

	// Get opening and closing brackets
	$: openingBracket = Array.isArray(data) ? '[' : '{';
	$: closingBracket = Array.isArray(data) ? ']' : '}';

	function toggleExpand() {
		if (hasChildren) {
			isExpanded = !isExpanded;
		}
	}

	/**
	 * Escape HTML to prevent XSS attacks
	 */
	function escapeHtml(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	/**
	 * Render value with syntax highlighting
	 */
	function renderValue(value) {
		if (value === null) {
			return '<span class="text-gray-500 dark:text-gray-400 italic">null</span>';
		}
		if (typeof value === 'string') {
			return `<span class="text-green-600 dark:text-green-400">"${escapeHtml(value)}"</span>`;
		}
		if (typeof value === 'number') {
			return `<span class="text-blue-600 dark:text-blue-400">${value}</span>`;
		}
		if (typeof value === 'boolean') {
			return `<span class="text-orange-600 dark:text-orange-400">${value}</span>`;
		}
		if (Array.isArray(value)) {
			return `<span class="text-purple-600 dark:text-purple-400">[${value.length} items]</span>`;
		}
		if (typeof value === 'object') {
			const keys = Object.keys(value);
			return `<span class="text-purple-600 dark:text-purple-400">{${keys.length} keys}</span>`;
		}
		return escapeHtml(JSON.stringify(value));
	}

	function getItemCount(data) {
		if (Array.isArray(data)) return data.length;
		if (typeof data === 'object') return Object.keys(data).length;
		return 0;
	}

	function getItemEntries(data) {
		if (Array.isArray(data)) {
			return data.map((item, index) => ({ key: index.toString(), value: item, isIndex: true }));
		} else {
			return Object.entries(data).map(([key, value]) => ({ key, value, isIndex: false }));
		}
	}

	function hasNestedObjects(data) {
		if (!data || typeof data !== 'object') return false;
		
		if (Array.isArray(data)) {
			return data.some(item => item && typeof item === 'object');
		} else {
			return Object.values(data).some(value => value && typeof value === 'object');
		}
	}

	// Render nested structure inline
	function renderNestedStructure(data, indent = 2) {
		const indentStr = ' '.repeat(indent);
		const childIndent = indent + 2;
		
		if (Array.isArray(data)) {
			if (data.length === 0) return '[]';
			
			const items = data.map(item => {
				if (item && typeof item === 'object') {
					return indentStr + renderNestedStructure(item, childIndent);
				} else {
					return indentStr + renderValue(item);
				}
			});
			
			return '[\n' + items.join(',\n') + '\n' + ' '.repeat(indent) + ']';
		} else {
			const keys = Object.keys(data);
			if (keys.length === 0) return '{}';
			
			const properties = keys.map(key => {
				const value = data[key];
				if (value && typeof value === 'object') {
					return indentStr + `"${key}": ${renderNestedStructure(value, childIndent)}`;
				} else {
					return indentStr + `"${key}": ${renderValue(value)}`;
				}
			});
			
			return '{\n' + properties.join(',\n') + '\n' + ' '.repeat(indent) + '}';
		}
	}
</script>

{#if data !== null}
	<div class="json-node" style="margin-left: {level * 16}px;">
		{#if keyName !== null}
			<span class="text-red-600 dark:text-red-400 font-mono">"{keyName}"</span>
			<span class="text-gray-500 mx-1">:</span>
		{/if}

		{#if hasChildren}
			<!-- Expandable/Collapsible Object or Array -->
			<button
				type="button"
				class="cursor-pointer select-none text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded px-1 py-0.5 -mx-1 transition-colors"
				on:click={toggleExpand}
				on:keydown={(e) => e.key === 'Enter' && toggleExpand()}
				tabindex="0"
			>
				<span class="text-gray-600 dark:text-gray-400 font-mono">{openingBracket}</span>

				{#if isExpanded}
					<!-- Expanded view - render nested components recursively -->
					<div class="ml-2">
						{#each getItemEntries(data) as entry, index}
							<div class="json-item flex items-start gap-1">
								{#if entry.isIndex}
									<!-- For arrays -->
									{#if entry.value && typeof entry.value === 'object'}
										<!-- Recursively render nested JsonNode -->
										<svelte:self data={entry.value} level={level + 1} />
									{:else}
										<span class="font-mono">
											{@html renderValue(entry.value)}
										</span>
									{/if}
								{:else}
									<!-- For objects -->
									{#if entry.value && typeof entry.value === 'object'}
										<!-- Recursively render nested JsonNode -->
										<svelte:self data={entry.value} keyName={entry.key} level={level + 1} />
									{:else}
										<span class="text-red-600 dark:text-red-400 font-mono">"{entry.key}"</span>
										<span class="text-gray-500 mx-1">:</span>
										<span class="font-mono">
											{@html renderValue(entry.value)}
										</span>
									{/if}
								{/if}
								{#if index < getItemEntries(data).length - 1}
									<span class="text-gray-500">,</span>
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<!-- Collapsed view -->
					<span class="text-purple-600 dark:text-purple-400 ml-1 font-mono">
						{getItemCount(data)} {Array.isArray(data) ? 'items...' : 'keys...'}
						{#if hasNestedObjects(data)}
							<span class="text-blue-500 dark:text-blue-400"> (nested)</span>
						{/if}
					</span>
				{/if}

				<span class="text-gray-600 dark:text-gray-400 font-mono">{closingBracket}</span>

				<!-- Toggle icon -->
				<span class="inline-block w-4 h-4 ml-1 text-gray-500">
					{#if hasChildren}
						{#if isExpanded}
							<span class="text-xs">▼</span>
						{:else}
							<span class="text-xs">▶</span>
						{/if}
					{/if}
				</span>
			</button>
		{:else}
			<!-- Primitive value -->
			<span class="font-mono">
				{@html renderValue(data)}
			</span>
		{/if}
	</div>
{/if}

<style>
	.json-node {
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.875rem;
		line-height: 1.4;
		margin-bottom: 0.125rem;
	}

	.json-item {
		display: flex;
		align-items: flex-start;
		gap: 0.25rem;
		margin-bottom: 0.125rem;
	}

	.nested-structure {
		margin-left: 0.5rem;
		padding: 0.5rem;
		background-color: rgba(243, 244, 246, 0.3);
		border-radius: 0.25rem;
		border: 1px solid rgba(156, 163, 175, 0.3);
		margin-top: 0.125rem;
		max-width: 100%;
	}

	.nested-structure pre {
		margin: 0;
		white-space: pre-wrap;
		word-break: break-word;
		font-size: 0.75rem;
		line-height: 1.3;
	}
</style>