#!/bin/bash
set -e

echo "Building Chrome extension..."

# Clean and build
rm -rf build/ .svelte-kit/
bun run build

# Extract the SvelteKit inline script from index.html
# The script contains __sveltekit variable and hydration code
SCRIPT_CONTENT=$(grep -A25 "__sveltekit" build/index.html | grep -B25 "</script>" | head -25)

# Compute SHA-256 hash of the script content
HASH=$(echo "$SCRIPT_CONTENT" | openssl dgst -sha256 -binary | openssl base64 -A)

echo "Computed script hash: sha256-$HASH"

# Add CSP with the hash to the manifest
# Use node to properly update the JSON
node -e "
const manifest = require('./build/manifest.json');
manifest.content_security_policy = {
  extension_pages: \"script-src 'self' 'sha256-$HASH'; object-src 'self'\"
};
require('fs').writeFileSync('./build/manifest.json', JSON.stringify(manifest, null, '\t'));
"

echo "Extension built with CSP hash!"
echo "Load the 'build/' folder in chrome://extensions/"
