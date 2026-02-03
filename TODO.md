# TODO

## Documentation
- [x] Create `docs/01-getting-started.md`
- [x] Create `docs/02-architecture.md`
- [x] Create `docs/03-supported-formats.md`
- [x] Create `docs/04-developer-guide.md`
- [x] Create `docs/05-security-and-privacy.md`

## Refactoring: JsonNode.svelte
### Phase 1: Security Hardening (Critical)
- [x] Remove `{@html}` usage in `renderValue`
- [x] Implement conditional rendering for different types (string, number, boolean, null)
- [x] Remove `escapeHtml` function (no longer needed)

### Phase 2: Performance & Pagination (High)
- [x] Implement `visibleItems` limit (e.g., 50)
- [x] Add "Show More" button for large arrays/objects
- [x] Update `entries` computation to support slice

### Phase 3: Depth Management & UX (Medium)
- [x] Add `maxDepth` prop
- [x] Force collapse items deeper than `maxDepth`

### Phase 4: Styling Architecture (Low)
- [x] Extract colors to `src/lib/stores/theme.js` or separate config
- [x] Apply colors via config/helper
