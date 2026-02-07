import { describe, test, expect } from 'bun:test';
import {
  findPrevWordStart,
  findNextWordEnd,
  getLineAndColumn,
  getCursorPosition,
  getLineStart,
  getLineEnd,
  getLineCount,
} from './text-navigation.js';

describe('findPrevWordStart', () => {
  test('returns 0 for position 0', () => {
    expect(findPrevWordStart('hello world', 0)).toBe(0);
  });

  test('returns 0 for position at start of first word', () => {
    expect(findPrevWordStart('hello world', 5)).toBe(0);
  });

  test('finds start of previous word', () => {
    expect(findPrevWordStart('hello world', 11)).toBe(6);
  });

  test('skips whitespace and punctuation', () => {
    expect(findPrevWordStart('hello, world!', 13)).toBe(7);
  });

  test('handles multiple spaces', () => {
    // Position 11 is at 'd' in 'world', should find start of 'world' at position 8
    expect(findPrevWordStart('hello   world', 11)).toBe(8);
  });

  test('handles start of string', () => {
    expect(findPrevWordStart('hello', 3)).toBe(0);
  });
});

describe('findNextWordEnd', () => {
  test('returns length for position at end', () => {
    expect(findNextWordEnd('hello world', 11)).toBe(11);
  });

  test('finds end of current word', () => {
    expect(findNextWordEnd('hello world', 0)).toBe(5);
  });

  test('finds end of next word', () => {
    expect(findNextWordEnd('hello world', 6)).toBe(11);
  });

  test('skips whitespace and punctuation', () => {
    expect(findNextWordEnd('hello, world!', 0)).toBe(5);
    expect(findNextWordEnd('hello, world!', 7)).toBe(12);
  });

  test('handles end of string', () => {
    expect(findNextWordEnd('hello', 0)).toBe(5);
    expect(findNextWordEnd('hello', 5)).toBe(5);
  });
});

describe('getLineAndColumn', () => {
  test('returns line 0, column 0 for position 0', () => {
    const result = getLineAndColumn('hello', 0);
    expect(result.line).toBe(0);
    expect(result.column).toBe(0);
  });

  test('returns correct line and column for single line', () => {
    const result = getLineAndColumn('hello world', 6);
    expect(result.line).toBe(0);
    expect(result.column).toBe(6);
  });

  test('returns correct line and column for multi-line', () => {
    const text = 'line1\nline2\nline3';
    expect(getLineAndColumn(text, 0)).toEqual({ line: 0, column: 0 });
    expect(getLineAndColumn(text, 6)).toEqual({ line: 1, column: 0 });
    expect(getLineAndColumn(text, 12)).toEqual({ line: 2, column: 0 }); // Position 12 is start of line3
    expect(getLineAndColumn(text, 13)).toEqual({ line: 2, column: 1 });
  });

  test('handles empty string', () => {
    const result = getLineAndColumn('', 0);
    expect(result.line).toBe(0);
    expect(result.column).toBe(0);
  });
});

describe('getCursorPosition', () => {
  test('returns 0 for line 0, column 0', () => {
    expect(getCursorPosition('hello', 0, 0)).toBe(0);
  });

  test('returns correct position for single line', () => {
    expect(getCursorPosition('hello world', 0, 6)).toBe(6);
  });

  test('returns correct position for multi-line', () => {
    const text = 'line1\nline2\nline3';
    expect(getCursorPosition(text, 0, 0)).toBe(0);
    expect(getCursorPosition(text, 1, 0)).toBe(6);
    expect(getCursorPosition(text, 1, 5)).toBe(11);
    expect(getCursorPosition(text, 2, 0)).toBe(12); // line3 starts at position 12
  });

  test('clamps column to line length', () => {
    const text = 'short\nlong line here';
    expect(getCursorPosition(text, 0, 100)).toBe(5); // Clamped to line length (5 chars)
    expect(getCursorPosition(text, 1, 100)).toBe(20); // Clamped to line length (14 chars + 6 for newline = 20)
  });
});

describe('getLineStart', () => {
  test('returns 0 for position 0', () => {
    expect(getLineStart('hello', 0)).toBe(0);
  });

  test('returns 0 for single line', () => {
    expect(getLineStart('hello world', 5)).toBe(0);
  });

  test('returns start of line for multi-line', () => {
    const text = 'line1\nline2\nline3';
    expect(getLineStart(text, 0)).toBe(0);
    expect(getLineStart(text, 6)).toBe(6);
    expect(getLineStart(text, 12)).toBe(12); // Position 12 is start of line3
    expect(getLineStart(text, 13)).toBe(12);
  });
});

describe('getLineEnd', () => {
  test('returns length for single line', () => {
    expect(getLineEnd('hello', 0)).toBe(5);
  });

  test('returns end of line before newline', () => {
    const text = 'line1\nline2';
    expect(getLineEnd(text, 0)).toBe(5);
    expect(getLineEnd(text, 3)).toBe(5);
    expect(getLineEnd(text, 6)).toBe(11);
  });

  test('returns text length for last line', () => {
    const text = 'line1\nline2';
    expect(getLineEnd(text, 11)).toBe(11);
  });
});

describe('getLineCount', () => {
  test('returns 1 for empty string', () => {
    expect(getLineCount('')).toBe(1);
  });

  test('returns 1 for single line', () => {
    expect(getLineCount('hello')).toBe(1);
  });

  test('returns correct count for multi-line', () => {
    expect(getLineCount('line1\nline2')).toBe(2);
    expect(getLineCount('line1\nline2\nline3')).toBe(3);
  });

  test('handles trailing newline', () => {
    expect(getLineCount('line1\n')).toBe(2);
  });
});
