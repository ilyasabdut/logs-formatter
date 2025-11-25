.PHONY: help install dev build docker-build docker-up docker-down docker-logs build-push

help:
	@echo "Available commands:"
	@echo "  make install      - Install dependencies using Bun"
	@echo "  make dev          - Start the SvelteKit development server"
	@echo "  make build        - Build the production-ready static application"
	@echo "  make docker-build - Build the Docker image using Docker Compose"
	@echo "  make build-push   - Build and push Docker image to registry"
	@echo "  make docker-up    - Start the application in a Docker container"
	@echo "  make docker-down  - Stop the Docker container"
	@echo "  make docker-logs  - View logs from the running container"

install:
	bun install

dev:
	bun run dev

build:
	bun run build

docker-build:
	docker compose build

build-push:
	@echo "Building and pushing Docker image to registry..."
	docker buildx build --platform linux/arm64 -t registry.ilyasabdut.loseyourip.com/log-formatter:latest --push .

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f
