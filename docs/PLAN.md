# Documentation Plan for Logs Formatter

This plan outlines the structure for the official documentation of the Logs Formatter project.

## Directory Structure

We recommend creating a `docs/` directory with the following structure:

```
docs/
├── 01-getting-started.md
├── 02-architecture.md
├── 03-supported-formats.md
├── 04-developer-guide.md
└── 05-security-and-privacy.md
```

## Content Outlines

### 01-getting-started.md
- **Introduction**: What is Logs Formatter?
- **Features**: Summary of key features (Auto Mode, TOON, Privacy).
- **Installation**:
  - Docker setup (`make docker-up`)
  - Local development (`make dev`)
- **Usage Guide**: Step-by-step instructions on formatting logs.

### 02-architecture.md
- **High-Level Overview**: Client-side SPA (SvelteKit).
- **Data Flow**: Input -> Detector -> Parser -> Formatter -> Output.
- **Key Components**:
  - `src/lib/parsers/detector.js`: How auto-detection works.
  - `src/lib/parsers/index.js`: The central routing logic.
  - `src/lib/stores`: State management.

### 03-supported-formats.md
- **TOON (Token-Oriented Object Notation)**:
  - Spec details and why it's optimized for LLMs.
  - Examples.
- **JSON / JSON Lines**: Handling of nested objects and arrays.
- **Kubernetes**: How `kubectl describe` output is parsed.
- **Web Server**: Regex patterns for Apache/Nginx.

### 04-developer-guide.md
- **Adding a New Parser**:
  1. Create file in `src/lib/parsers/`.
  2. Register in `detector.js`.
  3. Register in `index.js`.
- **Testing**: How to run `vitest` and manual test scripts.
- **Performance Considerations**: Guidelines for efficient parsing.

### 05-security-and-privacy.md
- **Privacy First**: Explanation of the client-side only architecture.
- **Security Best Practices**:
  - Input sanitization.
  - Safe HTML rendering with `JsonNode.svelte`.
