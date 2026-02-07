import { Database } from 'bun:sqlite';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

const DB_PATH = '.dexter/dexter.db';

// Ensure directory exists
mkdirSync(dirname(DB_PATH), { recursive: true });

// Create database connection
export const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
export function initDatabase(): void {
  db.exec('PRAGMA journal_mode = WAL;');
  
  // Create schema version table
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY
    );
  `);
  
  // Get current version
  const versionRow = db.query('SELECT version FROM schema_version LIMIT 1;').get() as { version: number } | undefined;
  const currentVersion = versionRow?.version ?? 0;
  
  // Run migrations
  if (currentVersion < 1) {
    migrateV1();
    db.run('INSERT OR REPLACE INTO schema_version (version) VALUES (1);');
  }
}

function migrateV1(): void {
  // Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      model TEXT,
      provider TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );
  `);
  
  // Events table for full replay capability
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      message_id TEXT,
      type TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
    );
  `);
  
  // Indexes for performance
  db.exec('CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON sessions(updated_at);');
}

// Types
export interface Session {
  id: string;
  title: string;
  model: string | null;
  provider: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Event {
  id: string;
  session_id: string;
  message_id: string | null;
  type: string;
  data: string;
  created_at: string;
}

// Session operations
export function createSession(id: string, title: string, model?: string, provider?: string): Session {
  db.run(
    'INSERT INTO sessions (id, title, model, provider) VALUES (?, ?, ?, ?);',
    [id, title, model ?? null, provider ?? null]
  );
  return getSession(id)!;
}

export function getSession(id: string): Session | undefined {
  return db.query('SELECT * FROM sessions WHERE id = ?;').get(id) as Session | undefined;
}

export function getSessions(): Session[] {
  return db.query('SELECT * FROM sessions ORDER BY updated_at DESC;').all() as Session[];
}

export function updateSessionTitle(id: string, title: string): void {
  db.run(
    'UPDATE sessions SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;',
    [title, id]
  );
}

export function updateSessionTimestamp(id: string): void {
  db.run('UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?;', [id]);
}

export function deleteSession(id: string): void {
  db.run('DELETE FROM sessions WHERE id = ?;', [id]);
}

// Message operations
export function createMessage(id: string, sessionId: string, role: 'user' | 'assistant', content: string): Message {
  db.run(
    'INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?);',
    [id, sessionId, role, content]
  );
  updateSessionTimestamp(sessionId);
  return getMessage(id)!;
}

export function getMessage(id: string): Message | undefined {
  return db.query('SELECT * FROM messages WHERE id = ?;').get(id) as Message | undefined;
}

export function getMessagesBySession(sessionId: string): Message[] {
  return db.query(
    'SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC;'
  ).all(sessionId) as Message[];
}

export function updateMessageContent(id: string, content: string): void {
  db.run('UPDATE messages SET content = ? WHERE id = ?;', [content, id]);
}

export function deleteMessage(id: string): void {
  db.run('DELETE FROM messages WHERE id = ?;', [id]);
}

// Event operations (for full replay)
export function createEvent(id: string, sessionId: string, type: string, data: unknown, messageId?: string): Event {
  const dataJson = JSON.stringify(data);
  db.run(
    'INSERT INTO events (id, session_id, message_id, type, data) VALUES (?, ?, ?, ?, ?);',
    [id, sessionId, messageId ?? null, type, dataJson]
  );
  return getEvent(id)!;
}

export function getEventsBySession(sessionId: string): Event[] {
  return db.query(
    'SELECT * FROM events WHERE session_id = ? ORDER BY created_at ASC;'
  ).all(sessionId) as Event[];
}

export function getEvent(id: string): Event | undefined {
  return db.query('SELECT * FROM events WHERE id = ?;').get(id) as Event | undefined;
}
