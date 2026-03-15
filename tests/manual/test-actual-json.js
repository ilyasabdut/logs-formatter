// Extract the actual JSON from test-examples.md and test it

// This is the JSON from test-examples.md (deeply nested example)
const testJSON = `{
  "user": {
    "id": 12345,
    "name": "John Doe",
    "email": "john@example.com",
    "active": true,
    "role": null,
    "profile": {
      "avatar": "https://example.com/avatar.jpg",
      "bio": "Software developer",
      "location": {
        "city": "San Francisco",
        "state": "CA",
        "country": "USA",
        "coordinates": {
          "lat": 37.7749,
          "lng": -122.4194
        }
      }
    }
  },
  "orders": [
    {
      "id": "ORD-001",
      "total": 299.99,
      "items": [
        {
          "product": "Laptop",
          "price": 999.99,
          "quantity": 1
        },
        {
          "product": "Mouse",
          "price": 29.99,
          "quantity": 2
        }
      ],
      "shipping": {
        "address": "123 Main St",
        "city": "New York",
        "tracking": {
          "number": "TRK123456",
          "status": "delivered",
          "updates": [
            {"time": "2025-01-01T10:00:00Z", "event": "shipped"},
            {"time": "2025-01-02T14:30:00Z", "event": "in_transit"},
            {"time": "2025-01-03T09:15:00Z", "event": "delivered"}
          ]
        }
      }
    }
  ],
  "settings": {
    "notifications": {
      "email": true,
      "sms": false,
      "push": true,
      "preferences": {
        "marketing": false,
        "updates": true,
        "security": true
      }
    },
    "privacy": {
      "public_profile": false,
      "show_email": false
    }
  }
}`;

console.log('Testing actual JSON from test-examples.md\n');
console.log('Length:', testJSON.length);

// Check for control characters
let controlChars = [];
for (let i = 0; i < testJSON.length; i++) {
  const code = testJSON.charCodeAt(i);
  if (code < 32 || code === 127) {
    const charName = code === 10 ? 'LF' : code === 13 ? 'CR' : code === 9 ? 'TAB' : '0x' + code.toString(16);
    controlChars.push({ pos: i, code, char: charName });
  }
}

console.log('\nControl characters:', controlChars.length);
if (controlChars.length > 0) {
  console.log('First 10:', controlChars.slice(0, 10));
}

// Test direct parse
try {
  JSON.parse(testJSON);
  console.log('\n✅ Direct parse: SUCCESS');
} catch (e) {
  console.log('\n❌ Direct parse: FAILED');
  console.log('   Error:', e.message);
}

// Test with sanitization (current approach)
function stripComments(text) {
  let cleaned = text.replace(/\/\/.*$/gm, '');
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  return cleaned;
}

const cleaned = stripComments(testJSON);
const sanitized = cleaned.replace(/\t/g, '  ').replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F]/g, '');

console.log('\nAfter sanitization:');
console.log('  Length:', sanitized.length);
console.log('  Chars removed:', testJSON.length - sanitized.length);

try {
  JSON.parse(sanitized);
  console.log('✅ Sanitized parse: SUCCESS');
} catch (e) {
  console.log('❌ Sanitized parse: FAILED');
  console.log('   Error:', e.message);

  // Find position 166 or whatever position the error mentions
  const match = e.message.match(/position (\d+)/);
  if (match) {
    const pos = parseInt(match[1]);
    console.log('   Character at position ' + pos + ':', sanitized.charCodeAt(pos), '"' + sanitized[pos] + '"');
    console.log('   Context: "' + sanitized.substring(Math.max(0, pos-20), pos+20) + '"');
  }
}
