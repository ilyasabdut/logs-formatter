# ---- Builder Stage ----
# Use a Bun image to build the SvelteKit application
FROM oven/bun:1-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build the application for production using the static adapter
RUN bun run build


# ---- Final Stage ----
# Use a lightweight Nginx image to serve the static files
FROM nginx:1.27-alpine

# Copy the static assets from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80 for the Nginx server
EXPOSE 80

# The default Nginx command will start the server
CMD ["nginx", "-g", "daemon off;"]
