// Test the FINAL fix for JSON parsing issue

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

console.log('=== Testing FINAL FIX ===\n');

// Simulate the FIXED stripComments function
function stripComments(text) {
  // First, try parsing without stripping - most JSON doesn't have comments
  try {
    JSON.parse(text);
    // If it parses successfully, don't strip comments (might contain URLs like https://)
    return text;
  } catch (e) {
    // Only strip comments if parsing failed
    // This regex only matches // at the start of a line (after whitespace) to avoid matching URLs
    let cleaned = text.replace(/^\s*\/\/.*$/gm, '');

    // Remove multi-line comments (/* comment */)
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');

    return cleaned;
  }
}

const cleaned = stripComments(testJSON.trim());

console.log('Test 1: JSON with URLs');
console.log('Original length:', testJSON.length);
console.log('After stripComments:', cleaned.length);
console.log('Characters changed:', testJSON.length - cleaned.length);

try {
  const parsed = JSON.parse(cleaned);
  console.log('✅ Parse: SUCCESS');
  console.log('✅ Data integrity verified:');
  console.log('   - user.name:', parsed.user.name);
  console.log('   - user.profile.avatar:', parsed.user.profile.avatar);
  console.log('   - user.profile.location.city:', parsed.user.profile.location.city);
  console.log('   - orders[0].items[0].product:', parsed.orders[0].items[0].product);
  console.log('   - orders[0].shipping.tracking.updates.length:', parsed.orders[0].shipping.tracking.updates.length);
} catch (e) {
  console.log('❌ Parse: FAILED');
  console.log('   Error:', e.message);
}

console.log('\n=== Test 2: JSON with Comments ===\n');

const jsonWithComments = `{
  // This is a single-line comment
  "name": "Test",
  /* This is a
     multi-line comment */
  "url": "https://example.com",
  // Another comment
  "value": 123
}`;

const cleanedWithComments = stripComments(jsonWithComments);
console.log('Original:');
console.log(jsonWithComments);
console.log('\nAfter stripComments:');
console.log(cleanedWithComments);

try {
  const parsed = JSON.parse(cleanedWithComments);
  console.log('\n✅ Parse: SUCCESS');
  console.log('   - name:', parsed.name);
  console.log('   - url:', parsed.url);
  console.log('   - value:', parsed.value);
} catch (e) {
  console.log('\n❌ Parse: FAILED');
  console.log('   Error:', e.message);
}

console.log('\n=== Test 3: Edge Cases ===\n');

// Test various URL schemes
const urlTests = [
  { name: 'https URL', json: '{"url":"https://example.com/path"}' },
  { name: 'http URL', json: '{"url":"http://example.com"}' },
  { name: 'URL with port', json: '{"url":"https://example.com:8080"}' },
  { name: 'URL with query', json: '{"url":"https://api.example.com/v1/users?id=123"}' },
  { name: 'Multiple URLs', json: '{"api":"https://api.com","cdn":"https://cdn.com"}' },
];

let passCount = 0;
urlTests.forEach(test => {
  try {
    const cleaned = stripComments(test.json);
    const parsed = JSON.parse(cleaned);
    console.log('✅', test.name + ':', parsed.url || parsed.api);
    passCount++;
  } catch (e) {
    console.log('❌', test.name + ':', e.message);
  }
});

console.log('\n=== Summary ===');
console.log('Passed:', passCount + '/' + urlTests.length);
console.log('\nThe fix:');
console.log('1. Try parsing without stripping comments first');
console.log('2. Only strip comments if parsing fails');
console.log('3. Use safer regex that only matches // at line start');
console.log('4. This preserves URLs like https:// in JSON values');
