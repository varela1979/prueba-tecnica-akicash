import { cn } from '@/lib/utils';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  totalResults: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  page,
  totalPages,
  totalResults,
  pageSize,
  onPageChange,
}: PaginationControlsProps) {
  const start = totalResults === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalResults);

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] text-ak-muted">
        Mostrando {start}–{end} de {totalResults} resultados
      </p>
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 sm:mx-0 sm:px-0">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="shrink-0 rounded-full border border-ak-border px-4 py-2 text-[13px] font-semibold text-ak-ink disabled:text-ak-subtle disabled:opacity-60"
        >
          Anterior
        </button>
        {pageNumbers.map((number) => (
          <button
            key={number}
            type="button"
            onClick={() => onPageChange(number)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold',
              number === page ? 'bg-ak-ink text-white' : 'text-ak-muted hover:bg-ak-surface',
            )}
          >
            {number}
          </button>
        ))}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="shrink-0 rounded-full border border-ak-border px-4 py-2 text-[13px] font-semibold text-ak-ink disabled:text-ak-subtle disabled:opacity-60"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
