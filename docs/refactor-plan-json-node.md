# Refactoring Plan: JSON Tree Viewer (`JsonNode.svelte`)

This document outlines the roadmap for refactoring the `src/lib/components/JsonNode.svelte` component. The current implementation uses recursive rendering which poses security risks (XSS) and performance bottlenecks with large datasets.

## Phase 1: Security Hardening (Priority: Critical)

**Goal**: Eliminate Cross-Site Scripting (XSS) vulnerabilities by removing `{@html}` injection.

### Current Issue
The component currently constructs HTML strings manually in JavaScript and injects them using the `{@html}` tag.
```svelte
<!-- Current (Risky) -->
{@html renderValue(entry.value)}
```
If `escapeHtml` fails or is bypassed in future edits, malicious scripts in log data could execute.

### Proposed Solution
Replace HTML string injection with native Svelte conditional rendering.

1.  **Remove `renderValue` HTML generation**: Stop returning `<span class="...">`.
2.  **Use Svelte Logic**:
    ```svelte
    <!-- Proposed (Safe) -->
    {#if entry.value === null}
      <span class="text-gray-500 italic">null</span>
    {:else if typeof entry.value === 'string'}
      <span class="text-green-600">"{entry.value}"</span>
    {:else if typeof entry.value === 'number'}
      <span class="text-blue-600">{entry.value}</span>
    {/if}
    ```
3.  **Benefit**: Svelte automatically escapes all content inside `{tags}`, making XSS impossible by default.

## Phase 2: Performance & Pagination (Priority: High)

**Goal**: Prevent browser freezing/crashing when rendering large arrays or objects.

### Current Issue
If a log contains an array with 5,000 items, `JsonNode` recursively creates 5,000 instances of itself immediately upon expansion. This causes massive DOM layout thrashing and can crash the tab.

### Proposed Solution
Implement "Windowing" or "Pagination" for child elements.

1.  **Add `limit` State**: Start by showing only the first 50 items.
2.  **Add "Show More" Button**:
    -   If `data.length > 50`, render a "Show next 50" button at the bottom of the list.
    -   Optionally: "Show All" (with a warning for >1000 items).
3.  **Implementation Logic**:
    ```javascript
    let visibleItems = 50;
    $: displayedEntries = entries.slice(0, visibleItems);
    ```

## Phase 3: Depth Management & UX (Priority: Medium)

**Goal**: Improve readability and prevent infinite recursion performance hits.

### Current Issue
Deeply nested objects (e.g., stack traces or complex metadata) expand based on simple item count rules, leading to cluttered views.

### Proposed Solution
1.  **Strict Max Depth**: Add a `maxDepth` prop (e.g., default 10).
2.  **Forced Collapse**: If `level > maxDepth`, force the node to be collapsed by default, regardless of its size.
3.  **Visual Indicators**: Clearly visually distinguish deeply nested levels (e.g., background color adjustments are already partially implemented, but can be refined).

## Phase 4: Styling Architecture (Priority: Low)

**Goal**: Decouple styling from logic to support theming better.

### Current Issue
Tailwind classes like `text-green-600` are hardcoded inside the JavaScript logic or template.

### Proposed Solution
1.  **Extract Theme Config**: Create a `theme.js` utility.
    ```javascript
    export const syntaxColors = {
      string: 'text-green-600 dark:text-green-400',
      number: 'text-blue-600 dark:text-blue-400',
      boolean: 'text-orange-600 dark:text-orange-400',
      null: 'text-gray-500 italic'
    };
    ```
2.  **Apply via Helper**: Use this config in the template to make changing syntax highlighting colors global and easy.

---

## Execution Strategy

1.  **Step 1**: Execute Phase 1 (Security) immediately as it requires no structural changes, just template refactoring.
2.  **Step 2**: Execute Phase 2 (Performance) to ensure stability with large logs.
3.  **Step 3**: Phases 3 & 4 can be done as polish tasks.
