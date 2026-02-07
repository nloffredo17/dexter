import { motion } from 'framer-motion';
import { User, Bot, AlertCircle } from 'lucide-react';
import type { Message } from '@/hooks/useAgent';
import { EventLog } from './EventLog';
import { MarkdownContent } from './MarkdownContent';
import { cn } from '@/utils/cn';

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full max-w-3xl mx-auto"
    >
      {/* Label row */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <div
          className={cn(
            'w-5 h-5 flex items-center justify-center',
            isUser
              ? 'bg-[var(--color-surface-raised)] border border-[var(--color-border)]'
              : 'bg-[var(--color-accent)] shadow-[2px_2px_0px_0px_var(--color-accent-dim)]',
          )}
        >
          {isUser ? (
            <User size={10} className="text-[var(--color-text-muted)]" />
          ) : (
            <Bot size={10} className="text-black" />
          )}
        </div>
        <span className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-text-dim)] font-bold">
          {isUser ? 'You' : 'Dexter'}
        </span>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <span className="text-[11px] text-[var(--color-text-dim)] tabular-nums">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </span>
      </div>

      {/* Body */}
      <div
        className={cn(
          'relative p-4 border text-[15px] leading-[1.7]',
          isUser
            ? 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-foreground)]'
            : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-foreground)] shadow-[4px_4px_0px_0px_#00000040]',
        )}
      >
        {/* Event log for assistant messages */}
        {!isUser && message.events.length > 0 && (
          <EventLog events={message.events} />
        )}

        {/* Content */}
        {message.content ? (
          isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <MarkdownContent content={message.content} />
          )
        ) : message.status === 'pending' || message.status === 'streaming' ? (
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-[3px] h-4 bg-[var(--color-accent)] animate-blink" />
          </div>
        ) : null}

        {/* Error state */}
        {message.status === 'error' && (
          <div className="mt-3 flex items-center gap-2 text-red-400 text-[12px] bg-red-500/5 border border-red-500/15 p-2.5 uppercase tracking-widest">
            <AlertCircle size={12} />
            <span>System Error</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
