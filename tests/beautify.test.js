import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { parseJSON } from '$lib/parsers/json.js';
import { formatLogs } from '$lib/parsers/index.js';
import JsonNode from '$lib/components/JsonNode.svelte';

// Mock console.error to suppress expected errors
vi.spyOn(console, 'error').mockImplementation(() => {});

// Test data
const validJSON = '{"level": "info", "message": "test message"}';
const nestedJSON = '{"level": "info", "server": {"host": "localhost", "port": 8080}}';
const nullLevelJSON = '{"level": null, "message": "test"}';
const emptyObjectJSON = '{}';
const arrayJSON = '[{"level": "info"}, {"level": "error"}]';

describe('JSON Parsing - Beautify Format', () => {
  it('should handle basic JSON beautification', () => {
    expect(() => parseJSON(validJSON, 'pretty')).not.toThrow();
    const result = parseJSON(validJSON, 'pretty');
    expect(result).toContain('"lvl"');
    expect(result).toContain('"msg"');
  });

  it('should handle nested objects', () => {
    expect(() => parseJSON(nestedJSON, 'pretty')).not.toThrow();
    const result = parseJSON(nestedJSON, 'pretty');
    expect(result).toContain('"lvl"');
    expect(result).toContain('"server"');
  });

  it('should handle null values gracefully', () => {
    expect(() => parseJSON(nullLevelJSON, 'pretty')).not.toThrow();
    const result = parseJSON(nullLevelJSON, 'pretty');
    expect(result).toContain('"msg"');
    expect(result).not.toContain('"lvl"'); // null values should be filtered out
  });

  it('should handle empty objects', () => {
    expect(() => parseJSON(emptyObjectJSON, 'pretty')).not.toThrow();
    const result = parseJSON(emptyObjectJSON, 'pretty');
    expect(result).toBe('{}');
  });

  it('should handle arrays', () => {
    expect(() => parseJSON(arrayJSON, 'pretty')).not.toThrow();
    const result = parseJSON(arrayJSON, 'pretty');
    expect(result).toContain('"lvl"');
  });
});

describe('JsonNode Component', () => {
  it('should render without crashing', () => {
    const testData = { level: 'info', message: 'test' };
    const { container } = render(JsonNode, { data: testData });
    expect(container).toBeTruthy();
  });

  it('should render nested objects', () => {
    const testData = { level: 'info', server: { host: 'localhost', port: 8080 } };
    const { container } = render(JsonNode, { data: testData });
    expect(container.textContent).toContain('level');
    expect(container.textContent).toContain('host'); // Should show nested property
    expect(container.textContent).toContain('localhost'); // Should show nested value
  });

  it('should handle null data', () => {
    const { container } = render(JsonNode, { data: null });
    expect(container.textContent).toBe('');
  });

  it('should handle empty objects', () => {
    const { container } = render(JsonNode, { data: {} });
    expect(container.textContent).toContain('0 keys');
  });
});

describe('FormatLogs Integration', () => {
  it('should format JSON to pretty format without errors', () => {
    expect(() => formatLogs(validJSON, 'json', 'pretty')).not.toThrow();
    const result = formatLogs(validJSON, 'json', 'pretty');
    expect(result.output).toContain('"lvl"');
    expect(result.output).toContain('"msg"');
  });

  it('should handle complex nested JSON', () => {
    const complexJSON = JSON.stringify({
      level: 'error',
      timestamp: '2025-01-01T10:00:00Z',
      message: 'Database connection failed',
      server: {
        host: 'localhost',
        port: 5432,
        config: {
          database: {
            host: 'db.example.com',
            ssl: true
          }
        }
      }
    });

    expect(() => formatLogs(complexJSON, 'json', 'pretty')).not.toThrow();
    const result = formatLogs(complexJSON, 'json', 'pretty');
    expect(result.output).toContain('"lvl"');
    expect(result.output).toContain('"server"');
  });

  it('should handle edge cases', () => {
    const edgeCases = [
      '{}',
      '[]',
      '{"empty": "", "null": null}',
      '{"level": "info", "deep": {"nested": {"object": {"with": "values"}}}}'
    ];

    edgeCases.forEach(testCase => {
      expect(() => formatLogs(testCase, 'json', 'pretty')).not.toThrow();
    });
  });
});

// Specific test for the "Cannot set properties" error
describe('Error Reproduction Test', () => {
  it('should NOT throw "Cannot set properties of undefined" error', () => {
    const problematicJSONs = [
      '{"level": "info", "message": "test"}',
      '{"level": null, "message": "test"}',
      '{"a": {"b": {"c": "deep"}}}',
      '{"level": "info", "self": {"level": "info", "nested": {"level": "error"}}}'
    ];

    problematicJSONs.forEach(json => {
      try {
        const result = parseJSON(json, 'pretty');
        // If we get here without throwing, the test passes
        expect(result).toBeTruthy();
      } catch (error) {
        // Check if it's the specific error we're trying to fix
        if (error.message && error.message.includes('Cannot set properties')) {
          throw new Error(`Found the target error in JSON: ${json}\nError: ${error.message}`);
        }
        // Other errors might be expected, but not the target one
        expect(error.message).not.toContain('Cannot set properties');
      }
    });
  });
});