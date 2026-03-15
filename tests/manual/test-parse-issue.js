// Test to reproduce the parsing issue at position 166

const testJSON = `{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "message": "User login successful",
  "user_id": 12345,
  "ip_address": "192.168.1.100",
  "metadata": {
    "browser": "Chrome",
    "version": "120.0.0",
    "os": "macOS"
  }
}`;

console.log('Original JSON length:', testJSON.length);
console.log('Character at position 166:', testJSON.charCodeAt(166), JSON.stringify(testJSON[166]));

// Check what's around position 166
const start = Math.max(0, 166 - 20);
const end = Math.min(testJSON.length, 166 + 20);
console.log('Context around position 166:');
console.log(JSON.stringify(testJSON.substring(start, end)));

// Try parsing
try {
  JSON.parse(testJSON);
  console.log('✅ Direct parse succeeded');
} catch (e) {
  console.log('❌ Direct parse failed:', e.message);
}

// Try with tab replacement
const withTabReplaced = testJSON.replace(/\t/g, '  ');
try {
  JSON.parse(withTabReplaced);
  console.log('✅ Parse after tab replacement succeeded');
} catch (e) {
  console.log('❌ Parse after tab replacement failed:', e.message);
}

// Try with current sanitization
const sanitized = testJSON.replace(/\t/g, '  ').replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F]/g, '');
console.log('\nSanitized length:', sanitized.length);
console.log('Difference:', testJSON.length - sanitized.length, 'characters removed');
try {
  JSON.parse(sanitized);
  console.log('✅ Parse after full sanitization succeeded');
} catch (e) {
  console.log('❌ Parse after full sanitization failed:', e.message);
}

// Check for control characters
let controlCharsFound = [];
for (let i = 0; i < testJSON.length; i++) {
  const code = testJSON.charCodeAt(i);
  if (code < 32 || code === 127) {
    controlCharsFound.push({
      position: i,
      charCode: code,
      char: testJSON[i],
      name: code === 9 ? 'TAB' : code === 10 ? 'LF' : code === 13 ? 'CR' : `0x${code.toString(16)}`
    });
  }
}

console.log('\nControl characters found:', controlCharsFound.length);
controlCharsFound.forEach(c => {
  console.log(`  Position ${c.position}: ${c.name} (code ${c.charCode})`);
});
