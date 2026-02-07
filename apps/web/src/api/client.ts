export interface ChatRequest {
  query: string;
  model?: string;
  provider?: string;
  conversationId?: string;
}

export type AgentEventType =
  | 'thinking'
  | 'tool_start'
  | 'tool_end'
  | 'answer_chunk'
  | 'done'
  | 'error';

export interface AgentEvent {
  type: AgentEventType;
  message?: string;
  tool?: string;
  args?: Record<string, unknown>;
  result?: unknown;
  chunk?: string;
  answer?: string;
  error?: string;
}

export async function* streamChat(
  request: ChatRequest,
): AsyncGenerator<AgentEvent> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          yield JSON.parse(line.slice(6));
        } catch {
          // skip malformed lines
        }
      }
    }
  }
}

export interface Model {
  id: string;
  displayName: string;
}

export interface Provider {
  displayName: string;
  providerId: string;
  models: Model[];
}

export async function fetchModels(): Promise<Provider[]> {
  const res = await fetch('/api/models');
  if (!res.ok) throw new Error('Failed to fetch models');
  const data = await res.json();
  return Array.isArray(data.providers) ? data.providers : [];
}
