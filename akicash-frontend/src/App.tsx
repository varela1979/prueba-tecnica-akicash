import { useEffect, useState } from 'react';
import { createLoanApplication } from '@/api/loanApplications';
import { ClientSearchInput } from '@/components/loan-applications/ClientSearchInput';
import { CreateLoanApplicationDialog } from '@/components/loan-applications/CreateLoanApplicationDialog';
import { DateRangeFilter } from '@/components/loan-applications/DateRangeFilter';
import { LoanApplicationsTable } from '@/components/loan-applications/LoanApplicationsTable';
import { PaginationControls } from '@/components/loan-applications/PaginationControls';
import { StatusFilterPills, type StatusFilterValue } from '@/components/loan-applications/StatusFilterPills';
import { Button } from '@/components/ui/button';

import { useLoanApplications } from './hooks/useLoanApplications';

const PAGE_SIZE = 10;

const EXAMPLE_CLIENTS = [
  { id: 1, fullName: 'Eduardo Jafet Varela Salinas' },
  { id: 2, fullName: 'María Fernanda López' },
];

function App() {
  const [status, setStatus] = useState<StatusFilterValue>('all');
  const [from, setFrom] = useState('');
  const [until, setUntil] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [clientSearch, setClientSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(clientSearch);
      setPage(1);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [clientSearch]);

  const {loans, loading, error, totalResults, refetch } = useLoanApplications({
    status,
    from,
    until,
    search: debouncedSearch,
    page,
    limit: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));

 return (
    <div className="flex min-h-screen flex-col bg-ak-bg">
      <header className="flex shrink-0 flex-col gap-3 border-b border-ak-border bg-white px-4 py-4 sm:h-[72px] sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-0">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-xl font-bold tracking-tight">
            AKi<span className="text-ak-accent-dark">&bull;</span>CASH
          </span>
          <span className="text-[13px] font-medium text-ak-subtle">Solicitudes de crédito</span>
        </div>
        <Button onClick={() => {setDialogOpen(true); setCreateError(null);}} className="w-full sm:w-auto">
          + Nueva solicitud
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-5 px-4 py-6 sm:px-10 sm:py-8">
        <div className="shrink-0">
          <h1 className="m-0 text-[22px] font-bold tracking-tight sm:text-[28px]">Solicitudes de crédito</h1>
          <p className="m-0 text-sm text-ak-muted">Gestiona el estado de cada solicitud y su plan de pagos.</p>
        </div>

        <div className="flex shrink-0 flex-col gap-4 rounded-2xl border border-ak-border bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 sm:mx-0 sm:px-0">
            <StatusFilterPills
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            />
          </div>
          <ClientSearchInput value={clientSearch} onChange={setClientSearch} />
          <DateRangeFilter
            from={from}
            until={until}
            onFromChange={(value) => {
              setFrom(value);
              setPage(1);
            }}
            onUntilChange={(value) => {
              setUntil(value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-1 rounded-2xl">
          <LoanApplicationsTable loans={loans} loading={loading} error={error} />
        </div>

        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalResults={totalResults}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </main>

      <CreateLoanApplicationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        clients={EXAMPLE_CLIENTS}
        submitting={submitting}
        errorMessage={createError}
        onSubmit={async (values) => {
          setSubmitting(true);
          setCreateError(null);

          try {
            await createLoanApplication(values);
            setDialogOpen(false);
            refetch();
          } catch (err) {
            setCreateError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </div>
  );
}

export default App;
