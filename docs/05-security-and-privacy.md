# Security and Privacy

## Privacy First Architecture
Logs Formatter is designed with a "Privacy First" philosophy.
-   **Client-Side Only**: The application is a static SPA. No backend server receives your log data.
-   **Zero Persistence**: Logs are held in memory only while the tab is open. We do not store logs in `localStorage` or `cookies`.
-   **Offline Capable**: The app can run entirely offline once loaded.

## Security Best Practices

### Input Sanitization
While we don't send data to a server, we still protect against Client-Side XSS (Self-XSS).
-   **Regex Sanitization**: We use strict regex-based replacements to neutralize HTML control characters.
-   **No `{@html}`**: The UI components use Svelte's safe text interpolation `{value}` wherever possible.

### Safe Rendering
The `JsonNode.svelte` component is the primary vector for displaying user-controlled content.
-   **Refactored Design**: We explicitly removed `{@html}` injection in favor of conditional rendering for specific types (strings, numbers, booleans).
-   **Theme Safety**: Styling is applied via class names, not inline styles constructed from user input.

### LocalStorage Safety
We wrap all `localStorage` access (used for theme preference only) in `try/catch` blocks. This prevents the application from crashing in restricted environments like:
-   Incognito / Private Browsing modes.
-   iframe embeddings with restrictive policies.
