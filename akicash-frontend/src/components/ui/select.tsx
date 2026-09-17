import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

export function Select({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'h-11 w-full appearance-none rounded-xl border border-ak-border bg-white px-3.5 pr-9 text-sm text-ak-ink focus:border-ak-accent-dark focus:outline-none focus:ring-2 focus:ring-ak-accent/40',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-ak-subtle">▾</span>
    </div>
  );
}
