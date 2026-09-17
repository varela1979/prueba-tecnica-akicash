import { cn } from '@/lib/utils';
import type { LoanStatus } from '@/types/loan-application';

export type StatusFilterValue = LoanStatus | 'all';

const OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'approved', label: 'Aprobada' },
  { value: 'rejected', label: 'Rechazada' },
];

interface StatusFilterPillsProps {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
}

export function StatusFilterPills({ value, onChange }: StatusFilterPillsProps) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition-colors',
              selected ? 'bg-ak-ink text-white' : 'bg-ak-surface text-ak-muted hover:bg-ak-border/60',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
