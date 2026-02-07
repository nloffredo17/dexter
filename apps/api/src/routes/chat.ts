import { Hono } from 'hono';
import { Agent } from '@dexter/core';
import { streamSSE } from 'hono/streaming';

const chat = new Hono();

chat.post('/', async (c) => {
  const { query, model, provider, conversationId } = await c.req.json();

  if (!query) {
    return c.json({ error: 'Query is required' }, 400);
  }

  return streamSSE(c, async (stream) => {
    const agent = Agent.create({
      model: model || 'gpt-5.2',
      modelProvider: provider || 'openai',
    });

    try {
      for await (const event of agent.run(query)) {
        await stream.writeSSE({
          event: event.type,
          data: JSON.stringify(event),
          id: conversationId,
        });

        if (event.type === 'done') {
          break;
        }
      }
    } catch (error) {
      console.error('Agent error:', error);
      await stream.writeSSE({
        event: 'error',
        data: JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      });
    }
  });
});

export default chat;
