import { useCallback } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar.js';
import { ChatInterface } from './components/Chat/ChatInterface.js';
import { useSessions } from './hooks/useSessions.js';
import { useAgent } from './hooks/useAgent.js';

function App() {
  const {
    sessions,
    currentSession,
    isLoading: sessionsLoading,
    loadSession,
    removeSession,
    clearCurrentSession,
  } = useSessions();

  const {
    messages,
    isStreaming,
    currentSessionId,
    sendMessage,
    loadSessionMessages,
    clearMessages,
  } = useAgent();

  // Handle new chat
  const handleNewChat = useCallback(() => {
    clearMessages();
    clearCurrentSession();
  }, [clearMessages, clearCurrentSession]);

  // Handle session selection
  const handleSelectSession = useCallback(async (id: string) => {
    // If already selected, do nothing
    if (currentSessionId === id) return;
    
    // Load session data
    await loadSession(id);
    
    // Load messages into agent
    if (currentSession?.messages) {
      loadSessionMessages(currentSession.messages);
    }
  }, [currentSessionId, currentSession, loadSession, loadSessionMessages]);

  // Handle session deletion
  const handleDeleteSession = useCallback(async (id: string) => {
    await removeSession(id);
    // If we deleted the current session, clear the chat
    if (currentSessionId === id) {
      clearMessages();
    }
  }, [removeSession, currentSessionId, clearMessages]);

  return (
    <div className="flex h-screen bg-[var(--color-background)] overflow-hidden noise-overlay">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        isLoading={sessionsLoading}
      />
      <main className="flex-1 relative">
        <ChatInterface
          messages={messages}
          isStreaming={isStreaming}
          currentSessionId={currentSessionId}
          onSendMessage={sendMessage}
        />
      </main>
    </div>
  );
}

export default App;
