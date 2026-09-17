import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', {
  variants: {
    status: {
      pending: 'bg-ak-pending-bg text-ak-pending-text',
      approved: 'bg-ak-approved-bg text-ak-approved-text',
      rejected: 'bg-ak-rejected-bg text-ak-rejected-text',
      neutral: 'bg-ak-surface text-ak-muted',
    },
  },
  defaultVariants: {
    status: 'neutral',
  },
});

interface BadgeProps extends ComponentProps<'span'>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, status, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ status, className }))} {...props} />;
}
