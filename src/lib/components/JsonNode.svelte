<script>
    import { jsonThemeStore } from '$lib/stores/jsonTheme.js';
    export let data = null;
    export let keyName = null;
    export let level = 0;
    export let maxDepth = 10;

    const CHUNK_SIZE = 50;
    let visibleItems = CHUNK_SIZE;

    // Get current theme from store
    $: theme = $jsonThemeStore || jsonThemeStore.getCurrentTheme();

    // Start collapsed if deeper than maxDepth
    let isExpanded = level <= maxDepth;
    let hasChildren = false;

    // Check if data has children (objects or arrays)
    $: {
        hasChildren = data && typeof data === 'object' &&
            ((Array.isArray(data) && data.length > 0) ||
            (!Array.isArray(data) && Object.keys(data).length > 0));
    }

    // Auto-expand objects with few children, collapse large ones
    // Only apply auto-expand logic if we are within maxDepth
    $: {
        if (hasChildren && level <= maxDepth) {
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

    function showMore() {
        visibleItems += CHUNK_SIZE;
    }

    // Compute entries once
    $: allEntries = getItemEntries(data);
    // Slice entries for pagination
    $: entries = allEntries.slice(0, visibleItems);
    $: remainingCount = Math.max(0, allEntries.length - visibleItems);

    function getItemCount(data) {
        if (Array.isArray(data)) return data.length;
        if (typeof data === 'object') return Object.keys(data).length;
        return 0;
    }

    function getItemEntries(data) {
        if (data === null || data === undefined) {
            return [];
        }
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

    // Check if a string value is a URL
    function isUrl(str) {
        if (typeof str !== 'string') return false;
        try {
            const url = new URL(str);
            return url.protocol === 'http:' || url.protocol === 'https:';
       	} catch {
        	return false;
        }
    }
</script>

{#if data !== null}
	<div class="json-node" style="margin-left: {level * 16}px;">
		{#if keyName !== null}
			<span class="{theme.colors.key}">"{keyName}"</span>
			<span class="{theme.colors.punctuation} mx-1">:</span>
		{/if}

		{#if hasChildren}
			<!-- Expandable/Collapsible Object or Array -->
			<button
				type="button"
				class="{theme.colors.button.base} {theme.colors.button.hover}"
				on:click={toggleExpand}
				on:keydown={(e) => e.key === 'Enter' && toggleExpand()}
				tabindex="0"
			>
				<span class="{theme.colors.bracket}">{openingBracket}</span>

				{#if isExpanded}
					<!-- Expanded view - render nested components recursively -->
					<div class="ml-2">
						{#each entries as entry, index}
							<div class="json-item flex items-start gap-1">
								{#if entry.isIndex}
									<!-- For arrays -->
									{#if entry.value && typeof entry.value === 'object'}
										<!-- Recursively render nested JsonNode -->
										<svelte:self data={entry.value} level={level + 1} maxDepth={maxDepth} />
									{:else}
										<span class="{theme.fonts.mono}">
                                            {#if entry.value === null}
                                                <span class="{theme.colors.null}">null</span>
                                            {:else if typeof entry.value === 'string'}
                                                {#if isUrl(entry.value)}
                                                	<a
                                                		href={entry.value}
                                                		target="_blank"
                                                		rel="noopener noreferrer"
                                                		class="{theme.colors.string} underline hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                                                		title="Click to open link"
                                                	>
                                                		"{entry.value}"
                                                	</a>
                                                {:else}
                                                	<span class="{theme.colors.string}">"{entry.value}"</span>
                                                {/if}
                                            {:else if typeof entry.value === 'number'}
                                                <span class="{theme.colors.number}">{entry.value}</span>
                                            {:else if typeof entry.value === 'boolean'}
                                                <span class="{theme.colors.boolean}">{entry.value}</span>
                                            {/if}
										</span>
									{/if}
								{:else}
									<!-- For objects -->
									{#if entry.value && typeof entry.value === 'object'}
										<!-- Recursively render nested JsonNode -->
										<svelte:self data={entry.value} keyName={entry.key} level={level + 1} maxDepth={maxDepth} />
									{:else}
										<span class="{theme.colors.key}">"{entry.key}"</span>
										<span class="{theme.colors.punctuation} mx-1">:</span>
										<span class="{theme.fonts.mono}">
                                            {#if entry.value === null}
                                                <span class="{theme.colors.null}">null</span>
                                            {:else if typeof entry.value === 'string'}
                                                {#if isUrl(entry.value)}
                                                	<a
                                                		href={entry.value}
                                                		target="_blank"
                                                		rel="noopener noreferrer"
                                                		class="{theme.colors.string} underline hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                                                		title="Click to open link"
                                                	>
                                                		"{entry.value}"
                                                	</a>
                                                {:else}
                                                	<span class="{theme.colors.string}">"{entry.value}"</span>
                                                {/if}
                                            {:else if typeof entry.value === 'number'}
                                                <span class="{theme.colors.number}">{entry.value}</span>
                                            {:else if typeof entry.value === 'boolean'}
                                                <span class="{theme.colors.boolean}">{entry.value}</span>
                                            {/if}
										</span>
									{/if}
								{/if}
								{#if index < entries.length - 1 || remainingCount > 0}
									<span class="{theme.colors.punctuation}">,</span>
								{/if}
							</div>
						{/each}

						{#if remainingCount > 0}
							<div class="json-item">
								<button
									type="button"
									class="{theme.colors.button.showMore}"
									on:click|stopPropagation={showMore}
								>
									Show {Math.min(remainingCount, CHUNK_SIZE)} more items ({remainingCount} remaining)
								</button>
							</div>
						{/if}
					</div>
				{:else}
					<!-- Collapsed view -->
					<span class="{theme.colors.meta}">
						{getItemCount(data)} {Array.isArray(data) ? 'items' : 'keys'}...
						{#if hasNestedObjects(data)}
							<span class="{theme.colors.metaNested}"> (nested)</span>
						{/if}
					</span>
				{/if}

				<span class="{theme.colors.bracket}">{closingBracket}</span>

				<!-- Toggle icon -->
				<span class="inline-block w-4 h-4 ml-1 {theme.colors.punctuation}">
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
			<!-- Primitive or Empty Value -->
			<span class="{theme.fonts.mono}">
                {#if data === null}
                    <span class="{theme.colors.null}">null</span>
                {:else if Array.isArray(data)}
                    <span class="{theme.colors.meta}">[{data.length} items]</span>
                {:else if typeof data === 'object'}
                     <span class="{theme.colors.meta}">{"{"}{Object.keys(data).length} keys{"}"}</span>
                {:else if typeof data === 'string'}
                    <span class="{theme.colors.string}">"{data}"</span>
                {:else if typeof data === 'number'}
                    <span class="{theme.colors.number}">{data}</span>
                {:else if typeof data === 'boolean'}
                    <span class="{theme.colors.boolean}">{data}</span>
                {/if}
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
</style>

