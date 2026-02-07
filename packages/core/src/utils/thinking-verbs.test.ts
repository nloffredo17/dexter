import { describe, test, expect } from 'bun:test';
import { THINKING_VERBS, getRandomThinkingVerb } from './thinking-verbs.js';

describe('THINKING_VERBS', () => {
  test('is a non-empty array', () => {
    expect(THINKING_VERBS.length).toBeGreaterThan(0);
  });

  test('contains only strings', () => {
    for (const verb of THINKING_VERBS) {
      expect(typeof verb).toBe('string');
      expect(verb.length).toBeGreaterThan(0);
    }
  });

  test('contains expected sample verbs', () => {
    expect(THINKING_VERBS).toContain('Cogitating');
    expect(THINKING_VERBS).toContain('Ruminating');
    expect(THINKING_VERBS).toContain('Pondering');
  });
});

describe('getRandomThinkingVerb', () => {
  test('returns a string', () => {
    const verb = getRandomThinkingVerb();
    expect(typeof verb).toBe('string');
    expect(verb.length).toBeGreaterThan(0);
  });

  test('returns a verb from THINKING_VERBS', () => {
    const verb = getRandomThinkingVerb();
    expect(THINKING_VERBS).toContain(verb);
  });

  test('can return different verbs on multiple calls', () => {
    const verbs = new Set<string>();
    // Call many times to increase chance of getting different values
    for (let i = 0; i < 100; i++) {
      verbs.add(getRandomThinkingVerb());
    }
    // With 100 calls and ~80 verbs, we should get at least a few different ones
    expect(verbs.size).toBeGreaterThan(1);
  });

  test('always returns valid verbs', () => {
    for (let i = 0; i < 50; i++) {
      const verb = getRandomThinkingVerb();
      expect(THINKING_VERBS).toContain(verb);
    }
  });
});
