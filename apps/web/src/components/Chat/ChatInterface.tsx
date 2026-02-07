import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, Terminal, Activity, Zap } from 'lucide-react';
import { MessageBubble } from './MessageBubble.js';
import { ModelSelector } from './ModelSelector.js';
import { Button } from '@/components/ui/Button.js';
import { cn } from '@/utils/cn.js';
import type { Message } from '@/hooks/useAgent.js';
import type { ChatRequest } from '@/api/client.js';

interface ChatInterfaceProps {
  messages: Message[];
  isStreaming: boolean;
  currentSessionId: string | null;
  onSendMessage: (query: string, options?: Partial<ChatRequest>) => Promise<void>;
}

export function ChatInterface({ 
  messages, 
  isStreaming, 
  currentSessionId,
  onSendMessage 
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState({
    model: 'gpt-5.2',
    provider: 'openai',
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSendMessage(trimmed, {
      model: selectedModel.model,
      provider: selectedModel.provider,
      sessionId: currentSessionId ?? undefined,
    });
    setInput('');
  };

  return (
    <div className="flex flex-col h-full relative z-10">
      {/* ── Header ── */}
      <header className="h-12 border-b border-[var(--color-border)] flex items-center justify-between px-5 bg-[var(--color-surface)]/80 backdrop-blur-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[var(--color-accent)] flex items-center justify-center rotate-2 shadow-[2px_2px_0px_0px_var(--color-accent-dim)]">
            <Zap size={14} className="text-black" />
          </div>
          <div className="flex items-center gap-3">
            <h1
              className="text-base font-bold tracking-[0.25em] text-[var(--color-foreground)] uppercase"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Dexter
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-[var(--color-text-dim)] uppercase tracking-widest">
                Online
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-dim)] uppercase tracking-widest">
            <Activity size={12} />
            <span>v2026.2</span>
          </div>
          <div className="w-px h-4 bg-[var(--color-border)]" />
          <ModelSelector
            onSelect={(model, provider) =>
              setSelectedModel({ model, provider })
            }
          />
        </div>
      </header>

      {/* ── Messages ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-8 space-y-6 custom-scrollbar"
      >
        {messages.length === 0 && <EmptyState />}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 max-w-3xl mx-auto pl-1"
          >
            <span className="text-[12px] uppercase tracking-[0.2em] text-[var(--color-accent)] animate-pulse">
              Agent processing
            </span>
            <span className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1 h-1 bg-[var(--color-accent)] rounded-full"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </span>
          </motion.div>
        )}
      </div>

      {/* ── Input ── */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-lg p-4 shrink-0">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto relative group"
        >
          {/* Glow ring */}
          <div className="absolute -inset-px bg-gradient-to-r from-[var(--color-accent)]/10 via-transparent to-[var(--color-accent)]/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] p-1.5 group-focus-within:border-[var(--color-border-highlight)] transition-colors">
            <div className="pl-2 text-[var(--color-text-dim)]">
              <Terminal size={14} />
            </div>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter research query..."
              disabled={isStreaming}
              className={cn(
                'flex-1 bg-transparent border-none outline-none',
                'text-sm tracking-wider text-[var(--color-foreground)]',
                'placeholder:text-[var(--color-text-dim)] placeholder:uppercase placeholder:tracking-[0.15em]',
                'disabled:opacity-40',
                'font-[family-name:var(--font-mono)]',
              )}
            />
            <Button
              type="submit"
              variant="accent"
              size="icon"
              disabled={!input.trim() || isStreaming}
              className="h-7 w-7"
            >
              <Send size={12} />
            </Button>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--color-text-dim)] uppercase tracking-[0.2em] px-0.5">
            <span>Enter to submit</span>
            <span>Encrypted session</span>
          </div>
        </form>
      </footer>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full min-h-[50vh] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col items-center gap-6"
      >
        {/* Logo mark */}
        <div className="relative">
          <div className="w-16 h-16 bg-[var(--color-accent)] flex items-center justify-center rotate-3 shadow-[6px_6px_0px_0px_var(--color-accent-dim)]">
            <Zap size={28} className="text-black" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[var(--color-background)]" />
        </div>

        <div className="text-center space-y-3">
          <h2
            className="text-2xl tracking-tight text-[var(--color-foreground)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Financial Intelligence Terminal
          </h2>
          <p className="text-[13px] text-[var(--color-text-muted)] uppercase tracking-[0.25em] max-w-sm leading-relaxed">
            Autonomous AI agent for deep financial research. Ask about
            companies, markets, valuations, or economic trends.
          </p>
        </div>

        <div className="flex gap-2 mt-2">
          {['Analyze AAPL', 'DCF for NVDA', 'Fed rate impact'].map(
            (prompt) => (
              <button
                key={prompt}
                className="px-3 py-1.5 text-[12px] uppercase tracking-widest border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-foreground)] hover:border-[var(--color-border-highlight)] hover:bg-[var(--color-surface-raised)] transition-all"
              >
                {prompt}
              </button>
            ),
          )}
        </div>
      </motion.div>
    </div>
  );
}
