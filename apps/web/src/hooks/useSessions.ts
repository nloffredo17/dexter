import { useState, useEffect, useCallback } from 'react';
import { 
  fetchSessions, 
  fetchSession, 
  createSession, 
  deleteSession,
  updateSession,
  type Session,
  type SessionWithMessages,
} from '@/api/client.js';

interface UseSessionsResult {
  sessions: Session[];
  currentSession: SessionWithMessages | null;
  isLoading: boolean;
  error: string | null;
  loadSessions: () => Promise<void>;
  loadSession: (id: string) => Promise<void>;
  createNewSession: (title: string, model?: string, provider?: string) => Promise<Session>;
  removeSession: (id: string) => Promise<void>;
  renameSession: (id: string, title: string) => Promise<void>;
  clearCurrentSession: () => void;
}

export function useSessions(): UseSessionsResult {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<SessionWithMessages | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSessions();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSession = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const session = await fetchSession(id);
      setCurrentSession(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewSession = useCallback(async (title: string, model?: string, provider?: string) => {
    setError(null);
    try {
      const session = await createSession(title, model, provider);
      setSessions(prev => [session, ...prev]);
      return session;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      throw err;
    }
  }, []);

  const removeSession = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (currentSession?.id === id) {
        setCurrentSession(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
      throw err;
    }
  }, [currentSession]);

  const renameSession = useCallback(async (id: string, title: string) => {
    setError(null);
    try {
      const updated = await updateSession(id, { title });
      setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
      if (currentSession?.id === id) {
        setCurrentSession(prev => prev ? { ...prev, ...updated } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename session');
      throw err;
    }
  }, [currentSession]);

  const clearCurrentSession = useCallback(() => {
    setCurrentSession(null);
  }, []);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    currentSession,
    isLoading,
    error,
    loadSessions,
    loadSession,
    createNewSession,
    removeSession,
    renameSession,
    clearCurrentSession,
  };
}
