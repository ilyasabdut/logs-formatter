# Supported Formats

Logs Formatter supports parsing and transforming a variety of common log formats.

## TOON (Token-Oriented Object Notation)
TOON is a custom format designed specifically for this application.
-   **Goal**: Minimize token count for LLM prompts without sacrificing human readability.
-   **Strategy**:
    -   Removes structural noise (quotes around keys, excessive braces).
    -   Compresses repeated keys in arrays.
    -   Uses significant whitespace instead of commas/braces where possible.

**Example**:
*JSON*:
```json
{"timestamp": "2024-01-01", "level": "INFO", "message": "User logged in"}
```
*TOON*:
```text
timestamp:2024-01-01 level:INFO message:User logged in
```

## JSON / JSON Lines
Full support for standard JSON objects and NDJSON (Newline Delimited JSON).
-   **Parsing**: Uses native `JSON.parse` with error recovery.
-   **Handling**: Automatically detects if the input is a single object or a stream of objects.

## Kubernetes Logs
Parses the output of `kubectl logs` and `kubectl describe`.
-   **Extraction**: Identifies key-value pairs (e.g., `Events:`, `Status:`).
-   **Structure**: Converts flat text output into nested JSON structures representing the resource state.

## Web Server Logs (Apache / Nginx)
Supports standard Common Log Format (CLF) and Combined Log Format.
-   **Regex Parsing**: Extracts fields like IP, Timestamp, Method, URL, Status, and User Agent.
-   **Normalization**: Converts specific timestamp formats (e.g., `[10/Oct/2000:13:55:36 -0700]`) into standard ISO strings.
