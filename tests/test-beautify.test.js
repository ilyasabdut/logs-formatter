import { readFileSync } from 'fs';
import { describe, it, expect, vi } from 'vitest';
import { parseJSON } from '$lib/parsers/json.js';
import { formatLogs } from '$lib/parsers/index.js';

// Mock console methods
const originalError = console.error;
beforeEach(() => {
  vi.clearAllMocks();
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalError;
});

describe('Real-world test-beautify.json Test', () => {
  it('should process test-beautify.json without the "Cannot set properties" error', async () => {
    // Read the actual test-beautify.json file and extract only the JSON part (remove comments)
    const testDataPath = './test-beautify.json';
    let testDataContent = readFileSync(testDataPath, 'utf-8');
    
    // Remove JSON comments and extract clean JSON
    const lines = testDataContent.split('\n');
    const jsonLines = lines.filter(line => !line.trim().startsWith('//'));
    testDataContent = jsonLines.join('\n');
    
    console.log('📋 test-beautify.json content preview:');
    console.log(testDataContent.substring(0, 300) + '...');
    
    let errorCaught = null;
    
    try {
      // Step 1: Format the logs using the beautify format
      const result = formatLogs(testDataContent, 'json', 'pretty');
      
      console.log('✅ Step 1: formatLogs successful');
      console.log('Output preview:', result.output.substring(0, 200) + '...');
      
      // Step 2: Parse the result back to check it's valid JSON
      const parsedData = JSON.parse(result.output);
      
      console.log('✅ Step 2: JSON.parse successful');
      console.log('Parsed keys:', Object.keys(parsedData));
      
      // Step 3: Simulate what JsonNode would do
      let hasChildren = parsedData && typeof parsedData === 'object' &&
        ((Array.isArray(parsedData) && parsedData.length > 0) ||
        (!Array.isArray(parsedData) && Object.keys(parsedData).length > 0));
      
      let isExpanded = true;
      if (hasChildren) {
        if (Array.isArray(parsedData)) {
          isExpanded = parsedData.length <= 5;
        } else {
          isExpanded = Object.keys(parsedData).length <= 5;
        }
      }
      
      console.log('✅ Step 3: JsonNode logic simulation successful');
      console.log('hasChildren:', hasChildren);
      console.log('isExpanded:', isExpanded);
      
      // Step 4: Simulate the renderJSON function that might cause the error
      if (hasChildren && isExpanded) {
        // This is where the "Cannot set properties" error might occur
        function renderJSON(data, currentIndent = 0) {
          if (data === null || data === undefined) return 'null';

          if (typeof data !== 'object') {
            return JSON.stringify(data);
          }

          if (Array.isArray(data)) {
            if (data.length === 0) return '[]';

            const indentStr = ' '.repeat(currentIndent);
            const childIndentStr = ' '.repeat(currentIndent + 2);

            const elements = data.map(item => {
              const rendered = renderJSON(item, currentIndent + 2);
              return childIndentStr + rendered;
            });

            return '[\n' + elements.join(',\n') + '\n' + indentStr + ']';
          } else {
            const keys = Object.keys(data);
            if (keys.length === 0) return '{}';

            const indentStr = ' '.repeat(currentIndent);
            const childIndentStr = ' '.repeat(currentIndent + 2);

            const properties = keys.map(key => {
              const value = renderJSON(data[key], currentIndent + 2);
              return childIndentStr + `"${key}": ${value}`;
            });

            return '{\n' + properties.join(',\n') + '\n' + indentStr + '}';
          }
        }
        
        const rendered = renderJSON(parsedData);
        console.log('✅ Step 4: renderJSON successful');
        console.log('Rendered preview:', rendered.substring(0, 200) + '...');
      }
      
    } catch (error) {
      errorCaught = error;
      
      console.log('❌ Error caught:', error.message);
      console.log('Error stack:', error.stack);
      
      // Check if it's the specific error we're trying to fix
      if (error.message && error.message.includes('Cannot set properties of undefined')) {
        console.log('🎯 FOUND THE EXACT TARGET ERROR!');
        console.log('This is the error the user is experiencing.');
        throw error; // Re-throw to fail the test and show we found it
      }
    }
    
    // Test should complete without the target error
    expect(errorCaught).toBeNull();
    
    console.log('✅ All steps completed successfully!');
  });
  
  it('should handle the OutputArea workflow with test-beautify.json', async () => {
    let testDataContent = readFileSync('./test-beautify.json', 'utf-8');
    
    // Remove JSON comments and extract clean JSON
    const lines = testDataContent.split('\n');
    const jsonLines = lines.filter(line => !line.trim().startsWith('//'));
    testDataContent = jsonLines.join('\n');
    
    let errorOccurred = null;
    
    try {
      // Simulate the exact OutputArea workflow
      const result = formatLogs(testDataContent, 'json', 'pretty');
      
      // Check if it qualifies as pretty JSON (OutputArea logic)
      function isPrettyJSON(text) {
        if (!text) return false;
        try {
          const parsed = JSON.parse(text);
          const hasIndentation = text.includes('{\\n') || text.includes('[\\n');
          const hasSpaces = text.includes('  ');
          return hasIndentation || hasSpaces;
        } catch {
          return false;
        }
      }
      
      const qualifiesAsPretty = isPrettyJSON(result.output);
      expect(qualifiesAsPretty).toBe(true);
      
      // Parse JSON data for JsonNode (OutputArea logic)
      const parsedData = JSON.parse(result.output);
      expect(parsedData).toBeTruthy();
      
      console.log('✅ OutputArea workflow simulation successful');
      console.log('Parsed data keys:', Object.keys(parsedData));
      
    } catch (error) {
      errorOccurred = error;
      
      if (error.message && error.message.includes('Cannot set properties')) {
        console.log('🎯 ERROR FOUND in OutputArea workflow!');
        console.log('Full error details:', error);
        throw error;
      }
    }
    
    expect(errorOccurred).toBeNull();
  });
});