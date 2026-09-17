import { motion } from 'motion/react';
import { memo } from 'react';

import { StatusBadge } from '@/components/loan-applications/StatusBadge';
import type { LoanApplication } from '@/types/loan-application';

interface LoanApplicationsTableProps {
  loans: LoanApplication[];
  loading: boolean;
  error: string | null;
}

const currencyFormatter = new Intl.NumberFormat('es-HN', {
  style: 'currency',
  currency: 'HNL',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('es-HN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const COLUMNS = ['ID', 'Cliente', 'Monto', 'Plazo', 'Estado', 'Creada'];

function LoanApplicationsTableComponent({ loans, loading, error }: LoanApplicationsTableProps) {
  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-ak-border bg-white px-6 py-10 text-center text-sm font-medium text-ak-rejected-text">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Desktop / tablet: tabla con columnas */}
      <div className="hidden flex-1 flex-col overflow-hidden rounded-2xl border border-ak-border bg-white md:flex">
        <div className="grid grid-cols-[90px_1.6fr_1fr_0.8fr_1fr_1fr] border-b border-ak-border bg-ak-surface px-6 py-3.5">
          {COLUMNS.map((column) => (
            <span key={column} className="text-[12px] font-bold tracking-wide text-ak-subtle">
              {column}
            </span>
          ))}
        </div>

        {loading && (
          <div className="divide-y divide-ak-border/70">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="grid grid-cols-[90px_1.6fr_1fr_0.8fr_1fr_1fr] items-center px-6 py-4">
                {Array.from({ length: 6 }).map((__, cell) => (
                  <div key={cell} className="h-3.5 w-[70%] animate-pulse rounded bg-ak-surface" />
                ))}
              </div>
            ))}
          </div>
        )}

        {!loading && loans.length === 0 && (
          <div className="px-6 py-14 text-center text-sm text-ak-muted">
            No hay solicitudes que coincidan con estos filtros.
          </div>
        )}

        {!loading && loans.length > 0 && (
          <div className="divide-y divide-ak-border/70">
            {loans.map((loan, index) => (
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: index * 0.03 }}
                className="grid grid-cols-[90px_1.6fr_1fr_0.8fr_1fr_1fr] items-center px-6 py-4"
              >
                <span className="text-[13px] font-semibold text-ak-muted">#{loan.id}</span>
                <span className="text-sm font-semibold text-ak-ink">{loan.clientName}</span>
                <span className="text-sm text-ak-ink">{currencyFormatter.format(loan.requestedAmount)}</span>
                <span className="text-sm text-ak-muted">{loan.termMonths} meses</span>
                <span>
                  <StatusBadge status={loan.status} />
                </span>
                <span className="text-[13px] text-ak-muted">{dateFormatter.format(new Date(loan.createdAt))}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile: una card por solicitud */}
      <div className="flex flex-col gap-3 md:hidden">
        {loading &&
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2.5 rounded-2xl border border-ak-border bg-white p-4">
              <div className="h-3.5 w-2/3 animate-pulse rounded bg-ak-surface" />
              <div className="h-3.5 w-1/3 animate-pulse rounded bg-ak-surface" />
              <div className="h-3.5 w-1/2 animate-pulse rounded bg-ak-surface" />
            </div>
          ))}

        {!loading && loans.length === 0 && (
          <div className="rounded-2xl border border-ak-border bg-white px-6 py-10 text-center text-sm text-ak-muted">
            No hay solicitudes que coincidan con estos filtros.
          </div>
        )}

        {!loading &&
          loans.map((loan, index) => (
            <motion.div
              key={loan.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: index * 0.03 }}
              className="rounded-2xl border border-ak-border bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-semibold text-ak-subtle">#{loan.id}</p>
                  <p className="text-sm font-semibold text-ak-ink">{loan.clientName}</p>
                </div>
                <StatusBadge status={loan.status} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-ak-ink">
                  {currencyFormatter.format(loan.requestedAmount)}
                </span>
                <span className="text-sm text-ak-muted">{loan.termMonths} meses</span>
              </div>
              <p className="mt-2 text-[12px] text-ak-subtle">
                Creada el {dateFormatter.format(new Date(loan.createdAt))}
              </p>
            </motion.div>
          ))}
      </div>
    </div>
  );
}

export const LoanApplicationsTable = memo(LoanApplicationsTableComponent);
