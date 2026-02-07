import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import chatRoutes from './routes/chat.js';
import modelRoutes from './routes/models.js';
import healthRoutes from './routes/health.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Routes
app.route('/api/chat', chatRoutes);
app.route('/api/models', modelRoutes);
app.route('/api/health', healthRoutes);

const port = process.env.PORT || 3002;

console.log(`Server is running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
