import { Hono } from 'hono';
import { createSession, getSessions, getSession, updateSessionTitle, deleteSession, getMessagesBySession, type Session, type Message } from '../db/index.js';

const sessions = new Hono();

interface SessionResponse extends Session {
  messageCount: number;
}

interface SessionDetailResponse extends Session {
  messages: Message[];
}

// GET /api/sessions - List all sessions
sessions.get('/', (c) => {
  const sessionsList = getSessions();
  
  // Add message count to each session
  const response: SessionResponse[] = sessionsList.map(session => ({
    ...session,
    messageCount: getMessagesBySession(session.id).length,
  }));
  
  return c.json({ sessions: response });
});

// POST /api/sessions - Create new session
sessions.post('/', async (c) => {
  const body = await c.req.json();
  const { title, model, provider } = body;
  
  if (!title || typeof title !== 'string') {
    return c.json({ error: 'Title is required' }, 400);
  }
  
  const id = crypto.randomUUID();
  const session = createSession(id, title, model, provider);
  
  return c.json({ session }, 201);
});

// GET /api/sessions/:id - Get session with messages
sessions.get('/:id', (c) => {
  const id = c.req.param('id');
  const session = getSession(id);
  
  if (!session) {
    return c.json({ error: 'Session not found' }, 404);
  }
  
  const messages = getMessagesBySession(id);
  
  const response: SessionDetailResponse = {
    ...session,
    messages,
  };
  
  return c.json({ session: response });
});

// PATCH /api/sessions/:id - Update session
sessions.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const session = getSession(id);
  
  if (!session) {
    return c.json({ error: 'Session not found' }, 404);
  }
  
  const body = await c.req.json();
  const { title } = body;
  
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return c.json({ error: 'Title must be a non-empty string' }, 400);
    }
    updateSessionTitle(id, title.trim());
  }
  
  const updatedSession = getSession(id);
  return c.json({ session: updatedSession });
});

// DELETE /api/sessions/:id - Delete session
sessions.delete('/:id', (c) => {
  const id = c.req.param('id');
  const session = getSession(id);
  
  if (!session) {
    return c.json({ error: 'Session not found' }, 404);
  }
  
  deleteSession(id);
  return c.json({ success: true });
});

export default sessions;
