import { useState } from 'react';
import { Plus, History, Settings, Database, Shield, BarChart3, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button.js';
import { cn } from '@/utils/cn.js';
import type { Session } from '@/api/client.js';

interface Props {
  sessions: Session[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  isLoading?: boolean;
}

export function Sidebar({ 
  sessions, 
  currentSessionId, 
  onNewChat, 
  onSelectSession, 
  onDeleteSession,
  isLoading 
}: Props) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteConfirmId === id) {
      onDeleteSession(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      // Reset confirmation after 3 seconds
      setTimeout(() => setDeleteConfirmId(prev => prev === id ? null : prev), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <aside className="w-56 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col shrink-0 relative z-10">
      {/* New chat button */}
      <div className="p-3 border-b border-[var(--color-border)]">
        <Button
          variant="accent"
          className="w-full gap-2 justify-center py-5"
          onClick={onNewChat}
        >
          <Plus size={14} />
          <span className="text-[12px]">New Research</span>
        </Button>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
        <div className="px-2 py-2 text-[11px] text-[var(--color-text-dim)] uppercase tracking-[0.25em] font-bold">
          Recent Sessions
        </div>

        {isLoading && sessions.length === 0 ? (
          <div className="px-3 py-4 text-[12px] text-[var(--color-text-dim)] text-center">
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="px-3 py-4 text-[12px] text-[var(--color-text-dim)] text-center">
            No sessions yet.
            <br />
            Start a new chat!
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={cn(
                'group w-full text-left px-3 py-2 text-[12px] transition-colors cursor-pointer relative',
                session.id === currentSessionId
                  ? 'bg-[var(--color-surface-raised)] text-[var(--color-accent)] border-l-2 border-[var(--color-accent)]'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-foreground)] border-l-2 border-transparent'
              )}
            >
              <div className="flex items-center gap-2">
                <History
                  size={10}
                  className={
                    session.id === currentSessionId
                      ? 'text-[var(--color-accent)]'
                      : 'text-[var(--color-text-dim)]'
                  }
                />
                <span className="truncate flex-1">{session.title}</span>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-[var(--color-text-dim)]">
                  {formatDate(session.updated_at)}
                </span>
                
                {/* Delete button - visible on hover or when confirming */}
                <button
                  onClick={(e) => handleDelete(session.id, e)}
                  className={cn(
                    'p-1 rounded transition-all',
                    deleteConfirmId === session.id
                      ? 'bg-red-500/20 text-red-400 opacity-100'
                      : 'opacity-0 group-hover:opacity-100 text-[var(--color-text-dim)] hover:text-red-400'
                  )}
                  title={deleteConfirmId === session.id ? 'Click again to confirm' : 'Delete session'}
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--color-border)] space-y-3">
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { icon: Database, label: 'DB' },
            { icon: Shield, label: 'SEC' },
            { icon: BarChart3, label: 'MKT' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 p-1.5 bg-[var(--color-surface-raised)]/50 border border-[var(--color-border)]"
            >
              <Icon size={12} className="text-[var(--color-text-dim)]" />
              <span className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-widest">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-1">
          <button className="text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] transition-colors">
            <Settings size={14} />
          </button>
          <div className="w-5 h-5 bg-[var(--color-surface-raised)] border border-[var(--color-border)] flex items-center justify-center text-[10px] text-[var(--color-text-muted)] font-bold">
            NL
          </div>
        </div>
      </div>
    </aside>
  );
}
