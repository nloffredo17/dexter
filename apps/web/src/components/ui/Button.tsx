import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium tracking-wider uppercase transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] disabled:pointer-events-none disabled:opacity-40 font-[family-name:var(--font-mono)]',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90',
        accent:
          'bg-[var(--color-accent)] text-black font-bold hover:brightness-110 shadow-[3px_3px_0px_0px_var(--color-accent-dim)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]',
        outline:
          'border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-surface-raised)] hover:border-[var(--color-border-highlight)]',
        ghost:
          'bg-transparent hover:bg-[var(--color-surface-raised)]',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 px-3 text-[12px]',
        lg: 'h-11 px-8',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
