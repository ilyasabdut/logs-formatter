# Getting Started

## Introduction
Logs Formatter is a powerful, client-side tool designed to parse, format, and optimize various log formats for better readability and AI analysis. It runs entirely in your browser, ensuring your data remains private and secure.

## Features
- **Smart Auto-Detection**: Automatically identifies log formats (JSON, Kubernetes, Apache/Nginx).
- **TOON Format**: A specialized "Token-Oriented Object Notation" optimized to reduce token usage for LLM prompts while maintaining readability.
- **Privacy First**: No data is ever sent to a server. All processing happens locally in your browser.
- **Performance**: Capable of handling large log files with optimized rendering and pagination.

## Installation

### Docker Setup
For a quick, isolated environment:
```bash
make docker-up
```
Access the app at `http://localhost:3000`.

### Local Development
To run the project locally with hot-reloading:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   make dev
   # OR
   npm run dev
   ```
3. Open your browser to `http://localhost:5173`.

## Usage Guide
1. **Paste Logs**: Copy your raw log data into the input area.
2. **Auto-Detect**: The application will automatically attempt to identify the format (e.g., JSON, Plain Text).
3. **Select Output**: Choose your desired output format:
   - **Pretty**: Standard beautified JSON for human reading.
   - **Compact**: Minified JSON for storage.
   - **TOON**: Optimized for pasting into ChatGPT/Claude.
4. **Transform**: Click "Transform Logs" to process.
5. **Explore**: Use the interactive JSON tree viewer to explore nested data structures.
