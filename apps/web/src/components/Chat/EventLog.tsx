import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Wrench,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import type { AgentEvent } from '@/api/client';
import { cn } from '@/utils/cn';

interface Props {
  events: AgentEvent[];
}

const iconMap: Record<string, { icon: typeof Brain; color: string; borderColor: string }> = {
  thinking: {
    icon: Brain,
    color: 'text-violet-400',
    borderColor: 'border-l-violet-500/40',
  },
  tool_start: {
    icon: Wrench,
    color: 'text-[var(--color-accent)]',
    borderColor: 'border-l-[var(--color-accent)]/40',
  },
  tool_end: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    borderColor: 'border-l-emerald-500/40',
  },
  error: {
    icon: AlertTriangle,
    color: 'text-red-400',
    borderColor: 'border-l-red-500/40',
  },
};

export function EventLog({ events }: Props) {
  const displayEvents = events.filter(
    (e) => e.type === 'thinking' || e.type === 'tool_start' || e.type === 'tool_end',
  );

  if (displayEvents.length === 0) return null;

  return (
    <div className="mb-3 space-y-1">
      <AnimatePresence initial={false}>
        {displayEvents.map((event, i) => {
          const config = iconMap[event.type] ?? iconMap.thinking;
          const Icon = config.icon;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className={cn(
                'flex items-start gap-2 border-l-2 pl-3 py-1.5',
                config.borderColor,
              )}
            >
              <Icon size={13} className={cn(config.color, 'mt-0.5 shrink-0')} />
              <div className="min-w-0">
                <span
                  className={cn(
                    'text-[12px] uppercase tracking-[0.15em] font-bold',
                    config.color,
                  )}
                >
                  {event.type === 'tool_start'
                    ? `exec: ${event.tool}`
                    : event.type === 'tool_end'
                    ? `done: ${event.tool}`
                    : 'Reasoning'}
                </span>
                {event.message && (
                  <p className="text-[12px] text-[var(--color-text-muted)] leading-relaxed mt-0.5 truncate max-w-md">
                    {event.message}
                  </p>
                )}
                {event.type === 'tool_start' && event.args && (
                  <p className="text-[12px] text-[var(--color-text-dim)] mt-0.5 truncate max-w-md font-mono">
                    <ChevronRight size={9} className="inline mr-1" />
                    {JSON.stringify(event.args)}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
