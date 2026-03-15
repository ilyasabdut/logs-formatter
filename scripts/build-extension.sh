#!/bin/bash
set -e

echo "Building Chrome extension..."

# Clean and build
rm -rf build/ .svelte-kit/
bun run build

# Create scripts directory
mkdir -p build/scripts

# Use Node.js to extract the inline script, write to external file, and update HTML
node -e "
const fs = require('fs');

const html = fs.readFileSync('build/index.html', 'utf8');

// Find the inline script containing __sveltekit
// Pattern: <script> ... __sveltekit ... </script>
const scriptRegex = /<script>([\s\S]*?__sveltekit[\s\S]*?)<\/script>/;
const match = html.match(scriptRegex);

if (match) {
  let scriptContent = match[1];
  const fullScriptTag = match[0];

  // Clean up the script content:
  // The inline script has the format: { indented_code }
  // We need to remove the outer braces and normalize indentation

  // Remove leading/trailing whitespace
  scriptContent = scriptContent.trim();

  // Remove outer wrapping: { content } -> content
  if (scriptContent.startsWith('{') && scriptContent.endsWith('}')) {
    scriptContent = scriptContent.slice(1, -1).trim();
  }

  // IMPORTANT: Fix relative import paths
  // The script uses \"./app/...\" which resolves relative to the script location
  // Since init.js is in scripts/, we need to change ./app/ -> /app/ for absolute paths
  // This ensures the imports resolve correctly from the extension root
  scriptContent = scriptContent.replace(/import\(\"\.\/app\//g, 'import(\"/app/');

  // Normalize indentation: replace tabs with spaces, then remove common leading whitespace
  // First, let's get each line and find the minimum indentation (excluding empty lines)
  const lines = scriptContent.replace(/\t/g, '    ').split('\n');

  // Find the minimum indentation among non-empty lines
  const nonEmptyLines = lines.filter(line => line.trim() !== '');
  if (nonEmptyLines.length > 0) {
    const minIndent = Math.min(...nonEmptyLines.map(line => {
      const match = line.match(/^(\s*)/);
      return match ? match[1].length : 0;
    }));

    // Remove the common indentation from all lines
    const cleanedLines = lines.map(line => {
      if (line.trim() === '') return '';
      // Remove exactly minIndent characters from the start
      return line.slice(minIndent);
    });
    scriptContent = cleanedLines.join('\n').trim();
  }

  // Write the cleaned script content to an external file
  fs.writeFileSync('build/scripts/init.js', scriptContent + '\n', 'utf8');

  // Replace the inline script with an external script tag
  const newHtml = html.replace(fullScriptTag, '<script src=\"./scripts/init.js\"></script>');
  fs.writeFileSync('build/index.html', newHtml, 'utf8');

  console.log('Extracted inline script to build/scripts/init.js');
  console.log('Updated build/index.html to use external script');
} else {
  console.error('Could not find inline __sveltekit script in index.html');
  process.exit(1);
}
"

# Add simple CSP without hash to the manifest
node -e "
const manifest = require('./build/manifest.json');
manifest.content_security_policy = {
  extension_pages: \"script-src 'self'; object-src 'self'\"
};
require('fs').writeFileSync('./build/manifest.json', JSON.stringify(manifest, null, '\t'));
"

echo "Extension built with external script and simple CSP!"
echo "Load the 'build/' folder in chrome://extensions/"
