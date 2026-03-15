// Test the fix for JSON parsing issue

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

console.log('=== Testing FIXED Approach ===\n');

// Simulate the NEW fixed code
function stripComments(text) {
  let cleaned = text.replace(/\/\/.*$/gm, '');
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  return cleaned;
}

const cleaned = stripComments(testJSON.trim());

console.log('Original length:', testJSON.length);
console.log('After stripComments:', cleaned.length);

try {
  const parsed = JSON.parse(cleaned);
  console.log('\n✅ FIXED parse: SUCCESS');
  console.log('✅ Data structure preserved');
  console.log('   - user.name:', parsed.user.name);
  console.log('   - user.profile.location.city:', parsed.user.profile.location.city);
  console.log('   - orders.length:', parsed.orders.length);
  console.log('   - orders[0].items.length:', parsed.orders[0].items.length);
  console.log('   - orders[0].shipping.tracking.updates.length:', parsed.orders[0].shipping.tracking.updates.length);
} catch (e) {
  console.log('\n❌ FIXED parse: FAILED');
  console.log('   Error:', e.message);
}

console.log('\n=== Testing Edge Cases ===\n');

// Test 1: JSON with tabs
const jsonWithTabs = '{\n\t"key": "value"\n}';
try {
  JSON.parse(stripComments(jsonWithTabs));
  console.log('✅ JSON with tabs: SUCCESS');
} catch (e) {
  console.log('❌ JSON with tabs: FAILED -', e.message);
}

// Test 2: JSON with CRLF
const jsonWithCRLF = '{\r\n  "key": "value"\r\n}';
try {
  JSON.parse(stripComments(jsonWithCRLF));
  console.log('✅ JSON with CRLF: SUCCESS');
} catch (e) {
  console.log('❌ JSON with CRLF: FAILED -', e.message);
}

// Test 3: Minified JSON
const minifiedJSON = '{"key":"value","nested":{"arr":[1,2,3]}}';
try {
  JSON.parse(stripComments(minifiedJSON));
  console.log('✅ Minified JSON: SUCCESS');
} catch (e) {
  console.log('❌ Minified JSON: FAILED -', e.message);
}

// Test 4: JSON with comments
const jsonWithComments = `{
  // This is a comment
  "key": "value", /* inline comment */
  "nested": {
    "arr": [1, 2, 3] // another comment
  }
}`;
try {
  JSON.parse(stripComments(jsonWithComments));
  console.log('✅ JSON with comments: SUCCESS');
} catch (e) {
  console.log('❌ JSON with comments: FAILED -', e.message);
}

console.log('\n=== Summary ===');
console.log('The fix removes aggressive sanitization that was corrupting valid JSON.');
console.log('JSON.parse natively handles whitespace (spaces, tabs, newlines) correctly.');
console.log('We only need to strip comments, then parse directly.');
