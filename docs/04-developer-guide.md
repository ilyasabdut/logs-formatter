# Developer Guide

## Adding a New Parser

To add support for a new log format (e.g., "Redis Logs"), follow these steps:

1.  **Create Parser Module**:
    Create `src/lib/parsers/redis.js`. It must export a function (e.g., `parseRedis`) that takes a string and returns a structured object or formatted string.

2.  **Register in Detector**:
    Update `src/lib/parsers/detector.js`. Add a regex or heuristic rule to `detectLogFormat` that returns `'redis'` when it identifies Redis patterns.

3.  **Register in Router**:
    Update `src/lib/parsers/index.js`. Add `'redis'` to the `parsers` map, pointing to a dynamic import:
    ```javascript
    const parsers = {
        // ...
        redis: () => import('./redis.js').then(m => m.parseRedis)
    };
    ```

## Testing

We use **Vitest** for unit and integration testing.

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Writing Tests
Create a file `tests/redis.test.js`. Ensure you cover:
-   **Happy Path**: Standard valid logs.
-   **Edge Cases**: Empty strings, malformed lines.
-   **Integration**: Verify it works with `formatLogs` in `index.js`.

## Performance Considerations
-   **Regex**: Define complex regexes at the module level (outside functions) to avoid recompilation overhead.
-   **Large Files**: Avoid `JSON.stringify` on massive objects if possible. Use the streaming or chunking approaches if implementing a new heavy parser.
-   **UI**: The `JsonNode` component handles pagination, but ensure your parser doesn't produce a single key with a 100MB string value, as that will still impact rendering.
