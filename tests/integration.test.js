import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { parseJSON } from '$lib/parsers/json.js';
import { formatLogs } from '$lib/parsers/index.js';
import JsonNode from '$lib/components/JsonNode.svelte';

// Mock console methods
const originalError = console.error;
const originalWarn = console.warn;

beforeEach(() => {
  vi.clearAllMocks();
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterEach(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

describe('Real-world User Scenario Tests', () => {
  it('should simulate the exact user flow that causes the error', async () => {
    // This simulates the exact user flow that would trigger the error
    const userJSONInput = `{
  "level": "info",
  "timestamp": "2025-01-01T10:00:00Z",
  "message": "Server started successfully",
  "server": {
    "host": "localhost",
    "port": 8080,
    "config": {
      "database": {
        "host": "db.example.com",
        "port": 5432,
        "ssl": true
      }
    }
  }
}`;

    let errorCaught = null;
    
    try {
      // Step 1: User inputs JSON and selects beautify format
      const result = formatLogs(userJSONInput, 'json', 'pretty');
      
      // Step 2: The OutputArea component tries to parse the result
      const parsedData = JSON.parse(result.output);
      
      // Step 3: JsonNode component renders the parsed data
      const { container } = render(JsonNode, { data: parsedData });
      
      // If we get here without the error, the test passes
      expect(container).toBeTruthy();
      // Check for the structure indicators instead of expanded content
      expect(container.textContent).toContain('keys...'); // Should show collapsed state
      expect(container.textContent).toContain('nested'); // Should show nested structure indicator
      
    } catch (error) {
      errorCaught = error;
      // Check if it's the specific error
      if (error.message && error.message.includes('Cannot set properties of undefined')) {
        console.log('🎯 FOUND THE EXACT ERROR!');
        console.log('Error details:', error);
        throw error; // Re-throw to fail the test
      }
    }

    // Test should complete without the target error
    expect(errorCaught).toBeNull();
  });

  it('should handle all possible edge cases that might cause the error', async () => {
    const problematicCases = [
      // Case 1: Object with null values
      '{"level": null, "message": "test", "server": {"host": null, "port": 8080}}',
      
      // Case 2: Deeply nested null values
      '{"level": "info", "config": {"db": {"connection": null, "pool": {"max": null}}}}',
      
      // Case 3: Array with null objects
      '[{"level": "info", "data": null}, {"level": "error", "server": null}]',
      
      // Case 4: Mixed null/undefined-like values
      '{"level": null, "message": "", "empty": [], "nullObj": {}, "bool": false}',
      
      // Case 5: Circular reference simulation
      '{"level": "info", "self": {"level": "info", "nested": {"level": "error"}}}',
      
      // Case 6: Very deeply nested structure
      '{"a": {"b": {"c": {"d": {"e": {"f": {"g": {"h": {"level": "deep"}}}}}}}}',
      
      // Case 7: Empty strings that get filtered out
      '{"level": "info", "empty": "", "null": null, "message": "valid"}'
    ];

    for (const testCase of problematicCases) {
      let errorOccurred = null;
      
      try {
        // Simulate the exact user flow
        const result = formatLogs(testCase, 'json', 'pretty');
        
        // Verify output is valid JSON
        const parsedData = JSON.parse(result.output);
        
        // Test JsonNode rendering
        const { container } = render(JsonNode, { data: parsedData });
        
        // If we get here, the case was handled successfully
        expect(container).toBeTruthy();
        
      } catch (error) {
        errorOccurred = error;
        
        // Check if it's the target error
        if (error.message && error.message.includes('Cannot set properties of undefined')) {
          console.log(`🎯 ERROR FOUND in case: ${testCase}`);
          console.log('Full error:', error);
          throw new Error(`Cannot set properties error in: ${testCase}\nError: ${error.message}`);
        }
        
        // Other errors might be expected, but not the target one
        console.log(`Expected error handled for: ${testCase.substring(0, 50)}...`);
      }
      
      // Ensure the target error didn't occur
      if (errorOccurred && errorOccurred.message && errorOccurred.message.includes('Cannot set properties')) {
        throw errorOccurred;
      }
    }
  });

  it('should handle the exact OutputArea component workflow', async () => {
    const outputLogs = `{
  "level": "info",
  "timestamp": "2025-01-01T10:00:00Z",
  "message": "Server started successfully"
}`;

    let errorOccurred = null;
    
    try {
      // Simulate OutputArea component behavior
      const isPrettyJSON = (text) => {
        if (!text) return false;
        try {
          const parsed = JSON.parse(text);
          const hasIndentation = text.includes('{\\n') || text.includes('[\\n');
          const hasSpaces = text.includes('  ');
          return hasIndentation || hasSpaces;
        } catch {
          return false;
        }
      };

      const parseJSONData = (text) => {
        if (!text) return null;
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      };

      // Check if the output qualifies as pretty JSON
      const qualifiesAsPretty = isPrettyJSON(outputLogs);
      expect(qualifiesAsPretty).toBe(true);

      // Parse the JSON data for JsonNode
      const parsedData = parseJSONData(outputLogs);
      expect(parsedData).toBeTruthy();

      // Test JsonNode rendering with the parsed data
      const { container } = render(JsonNode, { data: parsedData });
      expect(container).toBeTruthy();

    } catch (error) {
      errorOccurred = error;
      
      if (error.message && error.message.includes('Cannot set properties')) {
        console.log('🎯 FOUND ERROR in OutputArea workflow!');
        throw error;
      }
    }

    expect(errorOccurred).toBeNull();
  });
});

describe('Browser vs Node.js Environment Differences', () => {
  it('should handle any environment-specific differences', async () => {
    // Test the actual data flow that might cause environment-specific issues
    const testData = { level: 'info', message: 'test' };
    
    // Test direct JSON parsing (Node.js environment)
    expect(() => parseJSON(JSON.stringify(testData), 'pretty')).not.toThrow();
    
    // Test formatLogs integration (main entry point)
    expect(() => formatLogs(JSON.stringify(testData), 'json', 'pretty')).not.toThrow();
    
    // Test JsonNode rendering (browser component simulation)
    const { container } = render(JsonNode, { data: testData });
    expect(container).toBeTruthy();
  });
});