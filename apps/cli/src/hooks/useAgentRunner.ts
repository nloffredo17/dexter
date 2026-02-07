import { useState, useCallback, useRef } from 'react';
import { Agent, InMemoryChatHistory } from '@dexter/core';
import type { AgentConfig, AgentEvent, DoneEvent } from '@dexter/core';
import type { HistoryItem, WorkingState } from '../components/index.js';

/** Max run duration (10 min); aborts agent to avoid hung runs. */
const DEFAULT_RUN_TIMEOUT_MS = 10 * 60 * 1000;

/** Throttle tool_progress state updates to reduce re-renders (ms). */
const PROGRESS_BATCH_MS = 80;

// ============================================================================
// Types
// ============================================================================

export interface RunQueryResult {
  answer: string;
}

export interface UseAgentRunnerResult {
  // State
  history: HistoryItem[];
  workingState: WorkingState;
  error: string | null;
  isProcessing: boolean;
  
  // Actions
  runQuery: (query: string) => Promise<RunQueryResult | undefined>;
  cancelExecution: () => void;
  setError: (error: string | null) => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useAgentRunner(
  agentConfig: AgentConfig,
  inMemoryChatHistoryRef: React.RefObject<InMemoryChatHistory>
): UseAgentRunnerResult {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [workingState, setWorkingState] = useState<WorkingState>({ status: 'idle' });
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const runTimeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressMessageRef = useRef<string | null>(null);
  const progressFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper to update the last (processing) history item
  const updateLastHistoryItem = useCallback((
    updater: (item: HistoryItem) => Partial<HistoryItem>
  ) => {
    setHistory(prev => {
      const last = prev[prev.length - 1];
      if (!last || last.status !== 'processing') return prev;
      return [...prev.slice(0, -1), { ...last, ...updater(last) }];
    });
  }, []);
  
  // Flush throttled progress message to state
  const flushProgress = useCallback(() => {
    if (progressFlushTimerRef.current != null) {
      clearTimeout(progressFlushTimerRef.current);
      progressFlushTimerRef.current = null;
    }
    const msg = progressMessageRef.current;
    if (msg == null) return;
    progressMessageRef.current = null;
    updateLastHistoryItem(item => ({
      events: item.events.map(e =>
        e.id === item.activeToolId ? { ...e, progressMessage: msg } : e
      ),
    }));
  }, [updateLastHistoryItem]);

  // Handle agent events (tool_progress is throttled to reduce re-renders)
  const handleEvent = useCallback((event: AgentEvent) => {
    switch (event.type) {
      case 'thinking':
        flushProgress();
        setWorkingState({ status: 'thinking' });
        updateLastHistoryItem(item => ({
          events: [...item.events, {
            id: `thinking-${Date.now()}`,
            event,
            completed: true,
          }],
        }));
        break;
        
      case 'tool_start': {
        flushProgress();
        const toolId = `tool-${event.tool}-${Date.now()}`;
        setWorkingState({ status: 'tool', toolName: event.tool });
        updateLastHistoryItem(item => ({
          activeToolId: toolId,
          events: [...item.events, {
            id: toolId,
            event,
            completed: false,
          }],
        }));
        break;
      }

      case 'tool_progress':
        progressMessageRef.current = event.message;
        if (progressFlushTimerRef.current == null) {
          progressFlushTimerRef.current = setTimeout(flushProgress, PROGRESS_BATCH_MS);
        }
        break;
        
      case 'tool_end':
        flushProgress();
        setWorkingState({ status: 'thinking' });
        updateLastHistoryItem(item => ({
          activeToolId: undefined,
          events: item.events.map(e => 
            e.id === item.activeToolId
              ? { ...e, completed: true, endEvent: event }
              : e
          ),
        }));
        break;
        
      case 'tool_error':
        flushProgress();
        setWorkingState({ status: 'thinking' });
        updateLastHistoryItem(item => ({
          activeToolId: undefined,
          events: item.events.map(e => 
            e.id === item.activeToolId
              ? { ...e, completed: true, endEvent: event }
              : e
          ),
        }));
        break;
        
      case 'answer_start':
        flushProgress();
        setWorkingState({ status: 'answering', startTime: Date.now() });
        break;
        
      case 'done': {
        flushProgress();
        const doneEvent = event as DoneEvent;
        updateLastHistoryItem(item => {
          // Update answer in chat history for multi-turn context
          if (doneEvent.answer) {
            inMemoryChatHistoryRef.current?.saveAnswer(doneEvent.answer).catch(() => {
              // Silently ignore errors in updating history
            });
          }
          return {
            answer: doneEvent.answer,
            status: 'complete' as const,
            duration: doneEvent.totalTime,
            tokenUsage: doneEvent.tokenUsage,
            tokensPerSecond: doneEvent.tokensPerSecond,
          };
        });
        setWorkingState({ status: 'idle' });
        break;
      }
    }
  }, [updateLastHistoryItem, inMemoryChatHistoryRef, flushProgress]);

  // Run a query through the agent
  const runQuery = useCallback(async (query: string): Promise<RunQueryResult | undefined> => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    runTimeoutIdRef.current = setTimeout(() => {
      abortController.abort();
    }, DEFAULT_RUN_TIMEOUT_MS);

    // Track the final answer to return
    let finalAnswer: string | undefined;
    
    // Add to history immediately
    const itemId = Date.now().toString();
    const startTime = Date.now();
    setHistory(prev => [...prev, {
      id: itemId,
      query,
      events: [],
      answer: '',
      status: 'processing',
      startTime,
    }]);
    
    // Save query to chat history immediately for multi-turn context
    inMemoryChatHistoryRef.current?.saveUserQuery(query);
    
    setError(null);
    setWorkingState({ status: 'thinking' });
    
    try {
      const agent = await Agent.create({
        ...agentConfig,
        signal: abortController.signal,
      });
      const stream = agent.run(query, inMemoryChatHistoryRef.current!);
      
      for await (const event of stream) {
        // Capture the final answer from the done event
        if (event.type === 'done') {
          finalAnswer = (event as DoneEvent).answer;
        }
        handleEvent(event);
      }
      
      // Return the answer if we got one
      if (finalAnswer) {
        return { answer: finalAnswer };
      }
    } catch (e) {
      // Handle abort gracefully - mark as interrupted, not error
      if (e instanceof Error && e.name === 'AbortError') {
        setHistory(prev => {
          const last = prev[prev.length - 1];
          if (!last || last.status !== 'processing') return prev;
          return [...prev.slice(0, -1), { ...last, status: 'interrupted' }];
        });
        setWorkingState({ status: 'idle' });
        return undefined;
      }
      
      const errorMsg = e instanceof Error ? e.message : String(e);
      setError(errorMsg);
      // Mark the history item as error
      setHistory(prev => {
        const last = prev[prev.length - 1];
        if (!last || last.status !== 'processing') return prev;
        return [...prev.slice(0, -1), { ...last, status: 'error' }];
      });
      setWorkingState({ status: 'idle' });
      return undefined;
    } finally {
      if (runTimeoutIdRef.current != null) {
        clearTimeout(runTimeoutIdRef.current);
        runTimeoutIdRef.current = null;
      }
      abortControllerRef.current = null;
    }
  }, [agentConfig, inMemoryChatHistoryRef, handleEvent]);
  
  // Cancel the current execution
  const cancelExecution = useCallback(() => {
    if (progressFlushTimerRef.current != null) {
      clearTimeout(progressFlushTimerRef.current);
      progressFlushTimerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (runTimeoutIdRef.current != null) {
      clearTimeout(runTimeoutIdRef.current);
      runTimeoutIdRef.current = null;
    }
    // Mark current processing item as interrupted
    setHistory(prev => {
      const last = prev[prev.length - 1];
      if (!last || last.status !== 'processing') return prev;
      return [...prev.slice(0, -1), { ...last, status: 'interrupted' }];
    });
    setWorkingState({ status: 'idle' });
  }, []);
  
  // Check if currently processing
  const isProcessing = history.length > 0 && history[history.length - 1].status === 'processing';
  
  return {
    history,
    workingState,
    error,
    isProcessing,
    runQuery,
    cancelExecution,
    setError,
  };
}
