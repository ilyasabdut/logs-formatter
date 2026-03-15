#!/bin/bash
set -e

VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
OUTPUT="logs-formatter-extension-v${VERSION}.zip"

echo "Building extension v${VERSION}..."
bun run build

echo "Packaging extension..."
cd build
zip -r "../${OUTPUT}" .
cd ..

echo "Extension packaged: ${OUTPUT}"
ls -lh "${OUTPUT}"
