import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-xl border border-ak-border bg-white px-3.5 text-sm text-ak-ink placeholder:text-ak-subtle focus:border-ak-accent-dark focus:outline-none focus:ring-2 focus:ring-ak-accent/40',
        className,
      )}
      {...props}
    />
  );
}
