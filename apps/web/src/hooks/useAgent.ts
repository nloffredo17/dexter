import { useState, useCallback } from 'react';
import { streamChat, type AgentEvent, type ChatRequest } from '../api/client';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  events: AgentEvent[];
  status: 'pending' | 'streaming' | 'completed' | 'error';
  timestamp: number;
}

export function useAgent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(
    async (query: string, options: Partial<ChatRequest> = {}) => {
      if (isStreaming) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: query,
        events: [],
        status: 'completed',
        timestamp: Date.now(),
      };

      const assistantId = crypto.randomUUID();
      const assistantMessage: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        events: [],
        status: 'pending',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      try {
        for await (const event of streamChat({
          query,
          ...options,
          conversationId: assistantId,
        })) {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id !== assistantId) return msg;

              const events = [...msg.events, event];
              let content = msg.content;
              let status = msg.status as Message['status'];

              switch (event.type) {
                case 'thinking':
                  status = 'streaming';
                  break;
                case 'answer_chunk':
                  content += event.chunk ?? '';
                  status = 'streaming';
                  break;
                case 'done':
                  content = event.answer ?? content;
                  status = 'completed';
                  break;
                case 'error':
                  status = 'error';
                  content = event.error ?? 'An error occurred.';
                  break;
              }

              return { ...msg, content, events, status };
            }),
          );

          if (event.type === 'done' || event.type === 'error') break;
        }
      } catch (err) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  status: 'error' as const,
                  content:
                    err instanceof Error ? err.message : 'Connection failed.',
                }
              : msg,
          ),
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming],
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, isStreaming, sendMessage, clearMessages };
}
