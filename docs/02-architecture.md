# Architecture Overview

## High-Level Design
Logs Formatter is built as a **Client-Side Single Page Application (SPA)** using **SvelteKit**. This architecture was chosen to guarantee privacy (zero data egress) and high performance (immediate UI feedback).

## Data Flow
The application follows a linear data processing pipeline:

1.  **Input**: User pastes raw text into the `InputArea` component.
2.  **Detection**: `src/lib/parsers/detector.js` analyzes the input patterns (regex matches, JSON validity checks) to guess the format.
3.  **Routing**: `src/lib/parsers/index.js` acts as the central controller. It:
    -   Receives the input and detected type.
    -   Dynamically imports the specific parser module (code-splitting).
    -   Delegates the parsing work.
4.  **Formatting**: The specific parser (e.g., `json.js`, `kubernetes.js`) transforms the raw text into a structured JavaScript object.
5.  **Output**:
    -   The structured data is passed to `OutputArea`.
    -   `JsonNode.svelte` renders the data as an interactive, virtualized tree.

## Key Components

### 1. Detector (`src/lib/parsers/detector.js`)
Contains heuristic logic to identify log types. It assigns a confidence score to potential matches and selects the highest probability format.

### 2. Central Parser Router (`src/lib/parsers/index.js`)
Implements the Strategy pattern. It maintains a registry of available parsers and handles the async loading of parser modules to keep the initial bundle size small.

### 3. State Management (`src/lib/stores`)
Uses Svelte stores for reactive state management:
-   `theme.js`: Manages dark/light mode preferences (persisted to localStorage).
-   `app.js`: Holds application state like current input, output, and error messages.

### 4. Interactive Viewer (`src/lib/components/JsonNode.svelte`)
A recursive, performance-optimized component for rendering JSON trees. Key features:
-   **Security**: Uses native Svelte conditionals (no `{@html}`) to prevent XSS.
-   **Performance**: Implements pagination/windowing ("Show More") for large arrays to prevent DOM freezing.
-   **Theming**: Decoupled styling via `src/lib/utils/jsonTheme.js`.
