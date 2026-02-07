import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { initDatabase } from './db/index.js';
import chatRoutes from './routes/chat.js';
import modelRoutes from './routes/models.js';
import healthRoutes from './routes/health.js';
import sessionRoutes from './routes/sessions.js';

// Initialize database
initDatabase();

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Routes
app.route('/api/chat', chatRoutes);
app.route('/api/models', modelRoutes);
app.route('/api/health', healthRoutes);
app.route('/api/sessions', sessionRoutes);

const port = process.env.PORT || 3002;

console.log(`Server is running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
  // Set longer timeout for SSE streaming (255s max allowed by Bun)
  // Agent responses can take time, especially with multiple tool calls
  idleTimeout: 255,
};
