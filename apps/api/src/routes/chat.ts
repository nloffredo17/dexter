import { Hono } from 'hono';
import { Agent } from '@dexter/core';
import { streamSSE } from 'hono/streaming';
import { createSession, createMessage, updateMessageContent, getSession, getMessagesBySession } from '../db/index.js';

const chat = new Hono();

// Generate a title from the first user query
function generateTitle(query: string): string {
  // Take first 50 chars, truncate at word boundary
  const truncated = query.slice(0, 50);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 30) {
    return truncated.slice(0, lastSpace) + '...';
  }
  if (query.length > 50) {
    return truncated + '...';
  }
  return query;
}

chat.post('/', async (c) => {
  const { query, model, provider, conversationId, sessionId } = await c.req.json();

  if (!query) {
    return c.json({ error: 'Query is required' }, 400);
  }

  return streamSSE(c, async (stream) => {
    // Handle session management
    let currentSessionId = sessionId;
    let userMessageId: string | undefined;
    let assistantMessageId: string | undefined;
    
    // If sessionId provided, verify it exists
    if (currentSessionId) {
      const existingSession = getSession(currentSessionId);
      if (!existingSession) {
        await stream.writeSSE({
          event: 'error',
          data: JSON.stringify({ error: 'Session not found' }),
        });
        return;
      }
    } else {
      // Create new session
      currentSessionId = crypto.randomUUID();
      createSession(currentSessionId, generateTitle(query), model, provider);
    }
    
    // Save user message
    userMessageId = crypto.randomUUID();
    createMessage(userMessageId, currentSessionId, 'user', query);
    
    // Create assistant message placeholder
    assistantMessageId = crypto.randomUUID();
    createMessage(assistantMessageId, currentSessionId, 'assistant', '');
    
    // Send session info to client
    await stream.writeSSE({
      event: 'session',
      data: JSON.stringify({ sessionId: currentSessionId }),
      id: conversationId,
    });

    const agent = Agent.create({
      model: model || 'gpt-5.2',
      modelProvider: provider || 'openai',
    });

    try {
      let fullResponse = '';
      
      for await (const event of agent.run(query)) {
        // Accumulate the full response for saving
        if (event.type === 'done' && 'answer' in event) {
          fullResponse = (event as { answer?: string }).answer ?? '';
        }
        
        await stream.writeSSE({
          event: event.type,
          data: JSON.stringify(event),
          id: conversationId,
        });

        if (event.type === 'done') {
          break;
        }
      }
      
      // Update assistant message with full response
      if (assistantMessageId) {
        updateMessageContent(assistantMessageId, fullResponse);
      }
    } catch (error) {
      console.error('Agent error:', error);
      
      // Update assistant message with error
      if (assistantMessageId) {
        updateMessageContent(assistantMessageId, `Error: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      await stream.writeSSE({
        event: 'error',
        data: JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      });
    }
  });
});

export default chat;
