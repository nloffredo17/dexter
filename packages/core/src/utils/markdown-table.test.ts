import { describe, test, expect } from 'bun:test';
import {
  parseMarkdownTable,
  renderBoxTable,
  transformMarkdownTables,
  formatResponse,
} from './markdown-table.js';

describe('parseMarkdownTable', () => {
  test('parses simple markdown table', () => {
    const table = `| Header1 | Header2 |
|---------|---------|
| Cell1   | Cell2   |`;
    const result = parseMarkdownTable(table);
    expect(result).not.toBeNull();
    expect(result!.headers).toEqual(['Header1', 'Header2']);
    expect(result!.rows).toEqual([['Cell1', 'Cell2']]);
  });

  test('parses table with multiple rows', () => {
    const table = `| A | B |
|---|---|
| 1 | 2 |
| 3 | 4 |`;
    const result = parseMarkdownTable(table);
    expect(result).not.toBeNull();
    expect(result!.rows).toEqual([['1', '2'], ['3', '4']]);
  });

  test('returns null for invalid table', () => {
    expect(parseMarkdownTable('not a table')).toBeNull();
    // Empty rows array is valid structure, just no data
    const result = parseMarkdownTable('| Header |\n|--------|');
    expect(result).not.toBeNull();
    expect(result!.rows.length).toBe(0);
  });

  test('handles tables without leading/trailing pipes', () => {
    const table = `Header1 | Header2
---------|---------
Cell1    | Cell2`;
    const result = parseMarkdownTable(table);
    expect(result).not.toBeNull();
    expect(result!.headers.length).toBeGreaterThan(0);
  });
});

describe('renderBoxTable', () => {
  test('renders simple table', () => {
    const headers = ['A', 'B'];
    const rows = [['1', '2']];
    const result = renderBoxTable(headers, rows);
    expect(result).toContain('┌');
    expect(result).toContain('│');
    expect(result).toContain('└');
    expect(result).toContain('A');
    expect(result).toContain('B');
    expect(result).toContain('1');
    expect(result).toContain('2');
  });

  test('handles numeric alignment', () => {
    const headers = ['Name', 'Value'];
    const rows = [['Test', '$100'], ['Other', '$50']];
    const result = renderBoxTable(headers, rows);
    // Should right-align numeric columns
    expect(result).toContain('$100');
    expect(result).toContain('$50');
  });
});

describe('transformMarkdownTables', () => {
  test('transforms markdown table to box-drawing', () => {
    const content = `Here's a table:
| A | B |
|---|---|
| 1 | 2 |
And more text.`;
    const result = transformMarkdownTables(content);
    expect(result).toContain('┌');
    expect(result).toContain('│');
    expect(result).not.toContain('|---|---|');
    expect(result).toContain('And more text.');
  });

  test('leaves non-table content unchanged', () => {
    const content = 'Just some regular text with **bold** words.';
    const result = transformMarkdownTables(content);
    expect(result).toBe(content);
  });

  test('handles multiple tables', () => {
    const content = `| A | B |
|---|---|
| 1 | 2 |

| X | Y |
|---|---|
| 3 | 4 |`;
    const result = transformMarkdownTables(content);
    const tableMatches = (result.match(/┌/g) || []).length;
    expect(tableMatches).toBeGreaterThanOrEqual(2);
  });
});

describe('formatResponse', () => {
  test('transforms tables and bold', () => {
    const content = `Here's **bold** text and a table:
| A | B |
|---|---|
| 1 | 2 |`;
    const result = formatResponse(content);
    expect(result).toContain('┌'); // Table transformed
    // Bold should be transformed (chalk adds ANSI codes)
    expect(result).not.toContain('**bold**');
  });

  test('handles text without tables or bold', () => {
    const content = 'Just plain text here.';
    const result = formatResponse(content);
    expect(result).toBe(content);
  });
});
