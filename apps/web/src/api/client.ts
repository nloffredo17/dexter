export interface ChatRequest {
  query: string;
  model?: string;
  provider?: string;
  conversationId?: string;
  sessionId?: string;
}

export interface Session {
  id: string;
  title: string;
  model: string | null;
  provider: string | null;
  created_at: string;
  updated_at: string;
  messageCount: number;
}

export interface SessionWithMessages extends Session {
  messages: Message[];
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export type AgentEventType =
  | 'session'
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

// Session API

export async function fetchSessions(): Promise<Session[]> {
  const res = await fetch('/api/sessions');
  if (!res.ok) throw new Error('Failed to fetch sessions');
  const data = await res.json();
  return Array.isArray(data.sessions) ? data.sessions : [];
}

export async function createSession(title: string, model?: string, provider?: string): Promise<Session> {
  const res = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, model, provider }),
  });
  if (!res.ok) throw new Error('Failed to create session');
  const data = await res.json();
  return data.session;
}

export async function fetchSession(id: string): Promise<SessionWithMessages> {
  const res = await fetch(`/api/sessions/${id}`);
  if (!res.ok) throw new Error('Failed to fetch session');
  const data = await res.json();
  return data.session;
}

export async function updateSession(id: string, updates: { title?: string }): Promise<Session> {
  const res = await fetch(`/api/sessions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update session');
  const data = await res.json();
  return data.session;
}

export async function deleteSession(id: string): Promise<void> {
  const res = await fetch(`/api/sessions/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete session');
}
