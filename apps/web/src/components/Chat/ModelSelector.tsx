import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Cpu } from 'lucide-react';
import { fetchModels } from '@/api/client';
import { cn } from '@/utils/cn';

interface Props {
  onSelect: (model: string, provider: string) => void;
}

export function ModelSelector({ onSelect }: Props) {
  const [providers, setProviders] = useState<Awaited<ReturnType<typeof fetchModels>>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState({ model: 'gpt-5.2', provider: 'openai' });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchModels()
      .then(setProviders)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pick = (model: string, provider: string) => {
    setSelected({ model, provider });
    onSelect(model, provider);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-raised)] transition-colors group"
      >
        <Cpu
          size={11}
          className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors"
        />
        <span className="text-[12px] text-[var(--color-foreground)] uppercase tracking-widest font-bold">
          {selected.model}
        </span>
        <ChevronDown
          size={10}
          className={cn(
            'text-[var(--color-text-dim)] transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-60 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl z-50 p-1.5 max-h-[360px] overflow-y-auto custom-scrollbar">
          {providers.map(({ providerId, displayName, models }) => (
            <div key={providerId} className="mb-3 last:mb-0">
              <div className="px-2 py-1 text-[11px] text-[var(--color-text-dim)] uppercase tracking-[0.2em] font-bold border-b border-[var(--color-border)] mb-1">
                {displayName}
              </div>
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => pick(model.id, providerId)}
                  className={cn(
                    'w-full text-left px-2 py-1.5 text-[12px] uppercase tracking-wider transition-colors',
                    selected.model === model.id
                      ? 'bg-[var(--color-accent)] text-black font-bold'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-foreground)]',
                  )}
                >
                  {model.displayName}
                </button>
              ))}
            </div>
          ))}
          {providers.length === 0 && (
            <div className="px-2 py-4 text-[12px] text-[var(--color-text-dim)] text-center uppercase tracking-widest">
              Loading models...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
