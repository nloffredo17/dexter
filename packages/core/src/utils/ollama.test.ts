import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { getOllamaModels } from './ollama.js';

describe('getOllamaModels', () => {
  const originalEnv = process.env.OLLAMA_BASE_URL;
  const originalFetch = global.fetch;

  beforeEach(() => {
    delete process.env.OLLAMA_BASE_URL;
  });

  afterEach(() => {
    process.env.OLLAMA_BASE_URL = originalEnv;
    global.fetch = originalFetch;
  });

  test('returns empty array when Ollama is not running', async () => {
    global.fetch = async () => {
      throw new Error('ECONNREFUSED');
    };

    const models = await getOllamaModels();
    expect(models).toEqual([]);
  });

  test('returns empty array on non-OK response', async () => {
    global.fetch = async () => {
      return new Response(null, { status: 500 });
    };

    const models = await getOllamaModels();
    expect(models).toEqual([]);
  });

  test('returns models from valid response', async () => {
    global.fetch = async () => {
      return new Response(
        JSON.stringify({
          models: [
            { name: 'llama3', modified_at: '2024-01-01', size: 1000 },
            { name: 'mistral', modified_at: '2024-01-02', size: 2000 },
          ],
        }),
        { status: 200 }
      );
    };

    const models = await getOllamaModels();
    expect(models).toEqual(['llama3', 'mistral']);
  });

  test('filters out invalid model names', async () => {
    global.fetch = async () => {
      return new Response(
        JSON.stringify({
          models: [
            { name: 'valid', modified_at: '2024-01-01', size: 1000 },
            { name: null, modified_at: '2024-01-01', size: 1000 },
            { name: '', modified_at: '2024-01-01', size: 1000 },
            { name: 123, modified_at: '2024-01-01', size: 1000 },
          ],
        }),
        { status: 200 }
      );
    };

    const models = await getOllamaModels();
    // Empty strings pass the typeof check, so they're included
    expect(models).toEqual(['valid', '']);
  });

  test('handles missing models array', async () => {
    global.fetch = async () => {
      return new Response(JSON.stringify({}), { status: 200 });
    };

    const models = await getOllamaModels();
    expect(models).toEqual([]);
  });

  test('uses custom OLLAMA_BASE_URL from env', async () => {
    process.env.OLLAMA_BASE_URL = 'http://custom:11434';
    let fetchUrl = '';

    global.fetch = async (url: RequestInfo | URL) => {
      fetchUrl = url.toString();
      return new Response(JSON.stringify({ models: [] }), { status: 200 });
    };

    await getOllamaModels();
    expect(fetchUrl).toBe('http://custom:11434/api/tags');
  });

  test('defaults to localhost:11434', async () => {
    let fetchUrl = '';

    global.fetch = async (url: RequestInfo | URL) => {
      fetchUrl = url.toString();
      return new Response(JSON.stringify({ models: [] }), { status: 200 });
    };

    await getOllamaModels();
    expect(fetchUrl).toBe('http://localhost:11434/api/tags');
  });
});
