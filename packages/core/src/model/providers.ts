export interface Model {
  id: string;          // API model identifier (e.g., "claude-opus-4-6")
  displayName: string; // Human-readable name (e.g., "Opus 4.6")
}

export interface Provider {
  displayName: string;
  providerId: string;
  models: Model[];
}

export const PROVIDERS: Provider[] = [
  {
    displayName: 'OpenAI',
    providerId: 'openai',
    models: [
      { id: 'gpt-5.2', displayName: 'GPT 5.2' },
      { id: 'gpt-4.1', displayName: 'GPT 4.1' },
    ],
  },
  {
    displayName: 'Anthropic',
    providerId: 'anthropic',
    models: [
      { id: 'claude-sonnet-4-5', displayName: 'Sonnet 4.5' },
      { id: 'claude-opus-4-6', displayName: 'Opus 4.6' },
    ],
  },
  {
    displayName: 'Google',
    providerId: 'google',
    models: [
      { id: 'gemini-3-flash-preview', displayName: 'Gemini 3 Flash' },
      { id: 'gemini-3-pro-preview', displayName: 'Gemini 3 Pro' },
    ],
  },
  {
    displayName: 'xAI',
    providerId: 'xai',
    models: [
      { id: 'grok-4-0709', displayName: 'Grok 4' },
      { id: 'grok-4-1-fast-reasoning', displayName: 'Grok 4.1 Fast Reasoning' },
    ],
  },
  {
    displayName: 'OpenRouter',
    providerId: 'openrouter',
    models: [], // User types model name directly
  },
  {
    displayName: 'Ollama',
    providerId: 'ollama',
    models: [], // Populated dynamically from local Ollama API
  },
];
