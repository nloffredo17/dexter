import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/utils/cn';

interface Props {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className }: Props) {
  return (
    <div className={cn('markdown-content', className)}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Headings
        h1: ({ children }) => (
          <h1
            className="text-xl font-normal text-[var(--color-accent)] mt-6 mb-4 tracking-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2
            className="text-lg font-normal text-[var(--color-foreground)] mt-5 mb-3 tracking-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3
            className="text-base font-normal text-[var(--color-foreground)] mt-4 mb-2 tracking-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-sm font-bold text-[var(--color-foreground)] mt-4 mb-2 uppercase tracking-wider">
            {children}
          </h4>
        ),
        h5: ({ children }) => (
          <h5 className="text-xs font-bold text-[var(--color-text-muted)] mt-3 mb-2 uppercase tracking-wider">
            {children}
          </h5>
        ),
        h6: ({ children }) => (
          <h6 className="text-[11px] font-bold text-[var(--color-text-dim)] mt-3 mb-2 uppercase tracking-widest">
            {children}
          </h6>
        ),

        // Paragraphs
        p: ({ children }) => (
          <p className="mb-4 last:mb-0 text-[var(--color-foreground)] leading-[1.7]">
            {children}
          </p>
        ),

        // Text formatting
        strong: ({ children }) => (
          <strong className="font-bold text-[var(--color-accent)]">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
            {children}
          </em>
        ),
        del: ({ children }) => (
          <del className="line-through text-[var(--color-text-dim)]">
            {children}
          </del>
        ),

        // Code
        code: ({ children, className: codeClassName }) => {
          const isInline = !codeClassName;
          if (isInline) {
            return (
              <code className="px-1.5 py-0.5 bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-[var(--color-accent)] text-[13px] rounded-sm">
                {children}
              </code>
            );
          }
          return (
            <code className={codeClassName}>
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="my-4 p-4 bg-[var(--color-surface-raised)] border border-[var(--color-border)] overflow-x-auto text-[13px] leading-relaxed">
            {children}
          </pre>
        ),

        // Lists
        ul: ({ children }) => (
          <ul className="mb-4 pl-5 space-y-1 list-disc list-outside">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-4 pl-5 space-y-1 list-decimal list-outside">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-[var(--color-foreground)] leading-[1.7]">
            {children}
          </li>
        ),

        // Task lists (GFM)
        input: ({ checked }) => (
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="mr-2 accent-[var(--color-accent)]"
          />
        ),

        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote className="my-4 pl-4 border-l-2 border-[var(--color-accent)] text-[var(--color-text-muted)] italic">
            {children}
          </blockquote>
        ),

        // Links
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-foreground)] transition-colors"
          >
            {children}
          </a>
        ),

        // Tables (GFM)
        table: ({ children }) => (
          <div className="my-4 overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-[var(--color-surface-raised)]">
            {children}
          </thead>
        ),
        tbody: ({ children }) => (
          <tbody>{children}</tbody>
        ),
        tr: ({ children }) => (
          <tr className="border-b border-[var(--color-border)] last:border-b-0">
            {children}
          </tr>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 text-left text-[var(--color-accent)] font-bold uppercase tracking-wider text-[11px]">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 text-[var(--color-foreground)]">
            {children}
          </td>
        ),

        // Horizontal rule
        hr: () => (
          <hr className="my-6 border-[var(--color-border)]" />
        ),

        // Line breaks
        br: () => <br />,
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}
