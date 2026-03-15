// Test the stripComments function issue

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
  }
}`;

console.log('Original JSON:');
console.log(testJSON);
console.log('\nLength:', testJSON.length);

function stripComments(text) {
  // Remove single-line comments (// comment)
  let cleaned = text.replace(/\/\/.*$/gm, '');

  // Remove multi-line comments (/* comment */)
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');

  return cleaned;
}

const cleaned = stripComments(testJSON);

console.log('\n\nAfter stripComments:');
console.log(cleaned);
console.log('\nLength:', cleaned.length);

// Find the URL in the string
const urlIndex = testJSON.indexOf('https://');
console.log('\nURL starts at position:', urlIndex);
console.log('URL in original:', testJSON.substring(urlIndex, urlIndex + 30));

if (cleaned.indexOf('https://') !== urlIndex) {
  console.log('\n⚠️ WARNING: URL position changed after stripComments!');
  const newUrlIndex = cleaned.indexOf('https://');
  console.log('New URL position:', newUrlIndex);
  console.log('URL in cleaned:', cleaned.substring(newUrlIndex, newUrlIndex + 30));
}

// Check what's at position 166 in cleaned
console.log('\n\nChecking position 166 in cleaned string:');
console.log('Character code:', cleaned.charCodeAt(166));
console.log('Character:', JSON.stringify(cleaned[166]));
console.log('Context:', JSON.stringify(cleaned.substring(160, 180)));

// The issue: //example.com gets matched as a comment!
console.log('\n\n=== ROOT CAUSE ===');
console.log('The regex /\\/\\/.*$/gm matches ANY "//" in the text,');
console.log('including those in URLs like "https://example.com"!');
console.log('\nThis removes everything after the first // on each line.');
console.log('Result: "https://example.com" becomes "https:"');
