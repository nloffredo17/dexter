import { describe, test, expect } from 'bun:test';

/**
 * Integration test to verify all utilities exported from @dexter/core
 * can be imported correctly. This ensures the refactoring didn't break exports.
 */
describe('@dexter/core exports', () => {
  test('exports thinking-verbs utilities', async () => {
    const core = await import('./index.js');
    expect(core.THINKING_VERBS).toBeDefined();
    expect(core.getRandomThinkingVerb).toBeDefined();
    expect(typeof core.getRandomThinkingVerb).toBe('function');
  });

  test('exports markdown-table utilities', async () => {
    const core = await import('./index.js');
    expect(core.formatResponse).toBeDefined();
    expect(core.transformMarkdownTables).toBeDefined();
    expect(core.parseMarkdownTable).toBeDefined();
    expect(core.renderBoxTable).toBeDefined();
    expect(typeof core.formatResponse).toBe('function');
  });

  test('exports ollama utilities', async () => {
    const core = await import('./index.js');
    expect(core.getOllamaModels).toBeDefined();
    expect(typeof core.getOllamaModels).toBe('function');
  });

  test('exports text-navigation utilities', async () => {
    const core = await import('./index.js');
    expect(core.findPrevWordStart).toBeDefined();
    expect(core.findNextWordEnd).toBeDefined();
    expect(typeof core.findPrevWordStart).toBe('function');
    expect(typeof core.findNextWordEnd).toBe('function');
  });

  test('exports input-key-handlers utilities', async () => {
    const core = await import('./index.js');
    expect(core.cursorHandlers).toBeDefined();
    // CursorContext is a type, not a runtime value - check it exists via type import
    expect(typeof core.cursorHandlers.moveLeft).toBe('function');
  });

  test('exports long-term-chat-history utilities', async () => {
    const core = await import('./index.js');
    expect(core.LongTermChatHistory).toBeDefined();
    // ConversationEntry is a type, not a runtime value
    expect(typeof core.LongTermChatHistory).toBe('function');
  });

  test('exports env utilities', async () => {
    const core = await import('./index.js');
    expect(core.saveApiKeyForProvider).toBeDefined();
    expect(core.saveApiKeyToEnv).toBeDefined();
    expect(typeof core.saveApiKeyForProvider).toBe('function');
    expect(typeof core.saveApiKeyToEnv).toBe('function');
  });

  test('all exported functions are callable', async () => {
    const core = await import('./index.js');
    
    // Test that functions can be called (some may throw, but they're callable)
    expect(() => core.getRandomThinkingVerb()).not.toThrow();
    expect(() => core.findPrevWordStart('hello', 3)).not.toThrow();
    expect(() => core.findNextWordEnd('hello', 0)).not.toThrow();
    
    // cursorHandlers should have expected methods
    expect(core.cursorHandlers.moveLeft).toBeDefined();
    expect(core.cursorHandlers.moveRight).toBeDefined();
    expect(core.cursorHandlers.moveUp).toBeDefined();
    expect(core.cursorHandlers.moveDown).toBeDefined();
  });
});
