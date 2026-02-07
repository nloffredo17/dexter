import { describe, test, expect } from 'bun:test';
import { cursorHandlers, type CursorContext } from './input-key-handlers.js';

describe('cursorHandlers', () => {
  describe('moveLeft', () => {
    test('moves cursor left by one', () => {
      const ctx: CursorContext = { text: 'hello', cursorPosition: 3 };
      expect(cursorHandlers.moveLeft(ctx)).toBe(2);
    });

    test('does not go below 0', () => {
      const ctx: CursorContext = { text: 'hello', cursorPosition: 0 };
      expect(cursorHandlers.moveLeft(ctx)).toBe(0);
    });
  });

  describe('moveRight', () => {
    test('moves cursor right by one', () => {
      const ctx: CursorContext = { text: 'hello', cursorPosition: 2 };
      expect(cursorHandlers.moveRight(ctx)).toBe(3);
    });

    test('does not exceed text length', () => {
      const ctx: CursorContext = { text: 'hello', cursorPosition: 5 };
      expect(cursorHandlers.moveRight(ctx)).toBe(5);
    });
  });

  describe('moveToLineStart', () => {
    test('moves to start of current line', () => {
      const ctx: CursorContext = { text: 'hello\nworld', cursorPosition: 8 };
      expect(cursorHandlers.moveToLineStart(ctx)).toBe(6);
    });

    test('handles single line', () => {
      const ctx: CursorContext = { text: 'hello', cursorPosition: 3 };
      expect(cursorHandlers.moveToLineStart(ctx)).toBe(0);
    });
  });

  describe('moveToLineEnd', () => {
    test('moves to end of current line', () => {
      const ctx: CursorContext = { text: 'hello\nworld', cursorPosition: 2 };
      expect(cursorHandlers.moveToLineEnd(ctx)).toBe(5);
    });

    test('handles single line', () => {
      const ctx: CursorContext = { text: 'hello', cursorPosition: 2 };
      expect(cursorHandlers.moveToLineEnd(ctx)).toBe(5);
    });
  });

  describe('moveUp', () => {
    test('moves up one line maintaining column', () => {
      const ctx: CursorContext = { text: 'line1\nline2', cursorPosition: 8 };
      expect(cursorHandlers.moveUp(ctx)).toBe(2); // Column 2 on line 0
    });

    test('returns null on first line', () => {
      const ctx: CursorContext = { text: 'line1\nline2', cursorPosition: 2 };
      expect(cursorHandlers.moveUp(ctx)).toBeNull();
    });

    test('handles single line', () => {
      const ctx: CursorContext = { text: 'hello', cursorPosition: 2 };
      expect(cursorHandlers.moveUp(ctx)).toBeNull();
    });
  });

  describe('moveDown', () => {
    test('moves down one line maintaining column', () => {
      const ctx: CursorContext = { text: 'line1\nline2', cursorPosition: 2 };
      expect(cursorHandlers.moveDown(ctx)).toBe(8); // Column 2 on line 1
    });

    test('returns null on last line', () => {
      const ctx: CursorContext = { text: 'line1\nline2', cursorPosition: 8 };
      expect(cursorHandlers.moveDown(ctx)).toBeNull();
    });

    test('handles single line', () => {
      const ctx: CursorContext = { text: 'hello', cursorPosition: 2 };
      expect(cursorHandlers.moveDown(ctx)).toBeNull();
    });
  });

  describe('moveWordBackward', () => {
    test('moves to start of previous word', () => {
      const ctx: CursorContext = { text: 'hello world', cursorPosition: 8 };
      expect(cursorHandlers.moveWordBackward(ctx)).toBe(6);
    });

    test('handles start of text', () => {
      const ctx: CursorContext = { text: 'hello', cursorPosition: 3 };
      expect(cursorHandlers.moveWordBackward(ctx)).toBe(0);
    });
  });

  describe('moveWordForward', () => {
    test('moves to end of next word', () => {
      const ctx: CursorContext = { text: 'hello world', cursorPosition: 0 };
      expect(cursorHandlers.moveWordForward(ctx)).toBe(5);
    });

    test('handles end of text', () => {
      const ctx: CursorContext = { text: 'hello', cursorPosition: 0 };
      expect(cursorHandlers.moveWordForward(ctx)).toBe(5);
    });
  });
});
