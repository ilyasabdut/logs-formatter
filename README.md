# Log Formatter Web Platform

A fast, client-side web application that formats various log formats into compact, structured representations optimized for LLM consumption. All processing happens in your browser - no data is sent to any server.

## Features

- **Multi-Format Support**: JSON, Apache/Nginx logs, Kubernetes describe output, and plain text
- **Intelligent Auto-Detection**: Automatically detects log format with manual override option
- **Multiple Output Formats**: JSON Lines, Key-Value Lines, or Compact JSON
- **Privacy-First**: 100% client-side processing
- **Fast & Responsive**: Built with SvelteKit and Tailwind CSS
- **Dark Mode**: Toggle between light and dark themes with persistent preference
- **File Upload & Drag-Drop**: Easy file handling
- **Compression Stats**: Shows character reduction percentage

## Technology Stack

- **Runtime**: Bun
- **Framework**: SvelteKit with adapter-static
- **Styling**: Tailwind CSS
- **Deployment**: Docker + Nginx

## Quick Start

### Development

```bash
# Install dependencies
make install

# Start development server
make dev
```

Visit http://localhost:5173

### Production Build

```bash
# Build static application
make build
```

### Docker Deployment

```bash
# Build Docker image
make docker-build

# Start container
make docker-up

# View logs
make docker-logs

# Stop container
make docker-down
```

Visit http://localhost:8080

## Usage

1. **Input**: Paste logs or upload a file (supports drag-and-drop)
2. **Configure**: Select log type (or use auto-detect) and output format
3. **Format**: Click "Format Logs" to process
4. **Copy**: Use "Copy to Clipboard" to use the formatted output

## Project Structure

```
logs-formatter/
├── src/
│   ├── lib/
│   │   ├── components/      # Svelte components
│   │   ├── parsers/         # Log parsing logic
│   │   └── stores/          # State management
│   ├── routes/              # SvelteKit pages
│   ├── app.css             # Global styles
│   └── app.html            # HTML template
├── static/                  # Static assets
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Docker Compose config
├── Makefile               # Development commands
└── package.json           # Dependencies
```

## Supported Log Formats

### JSON / JSON Lines
```json
{"level":"info","msg":"Request processed","duration":123}
```

### Apache/Nginx Logs
```
192.168.1.1 - - [10/Oct/2000:13:55:36 -0700] "GET /index.html HTTP/1.1" 200 2326
```

### Kubernetes Describe
```
Name:         my-pod
Namespace:    default
Status:       Running
```

### Plain Text
```
2024-01-01 10:00:00 INFO Processing request id=123
```

## Output Formats

- **Auto**: Intelligently chooses the best format
- **JSON Lines**: One JSON object per line
- **Key-Value Lines**: Flattened key=value pairs
- **Compact JSON**: Minified JSON with nulls removed

## Makefile Commands

```bash
make help          # Show available commands
make install       # Install dependencies
make dev          # Start development server
make build        # Build for production
make docker-build # Build Docker image
make docker-up    # Start Docker container
make docker-down  # Stop Docker container
make docker-logs  # View container logs
```

## License

MIT
# logs-formatter
