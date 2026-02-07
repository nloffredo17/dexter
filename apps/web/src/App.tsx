import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatInterface } from './components/Chat/ChatInterface';

function App() {
  return (
    <div className="flex h-screen bg-[var(--color-background)] overflow-hidden noise-overlay">
      <Sidebar onNewChat={() => window.location.reload()} />
      <main className="flex-1 relative">
        <ChatInterface />
      </main>
    </div>
  );
}

export default App;
