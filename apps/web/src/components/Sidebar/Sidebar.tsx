import { Plus, History, Settings, Database, Shield, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface Props {
  onNewChat: () => void;
}

const demoSessions = [
  'AAPL Revenue Analysis',
  'NVDA Market Cap Forecast',
  'Fed Interest Rate Impact',
  'Crypto Liquidity Report',
];

export function Sidebar({ onNewChat }: Props) {
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

        {demoSessions.map((session, i) => (
          <button
            key={i}
            className={cn(
              'w-full text-left px-3 py-2 text-[12px] uppercase tracking-wider transition-colors',
              i === 0
                ? 'bg-[var(--color-surface-raised)] text-[var(--color-accent)] border-l-2 border-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-foreground)]',
            )}
          >
            <div className="flex items-center gap-2">
              <History
                size={10}
                className={
                  i === 0
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-text-dim)]'
                }
              />
              <span className="truncate">{session}</span>
            </div>
          </button>
        ))}
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
