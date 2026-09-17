import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ClientOption, LoanStatus } from '@/types/loan-application';

const TERM_OPTIONS = [6, 12, 24, 36, 48, 60, 72];

const STATUS_OPTIONS: { value: LoanStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'approved', label: 'Aprobada' },
  { value: 'rejected', label: 'Rechazada' },
];

export interface CreateLoanApplicationValues {
  clientId: number;
  requestedAmount: number;
  termMonths: number;
  status: LoanStatus;
}

interface CreateLoanApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: ClientOption[];
  submitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (values: CreateLoanApplicationValues) => void;
}

export function CreateLoanApplicationDialog({
  open,
  onOpenChange,
  clients,
  submitting = false,
  errorMessage = null,
  onSubmit,
}: CreateLoanApplicationDialogProps) {
  const [clientId, setClientId] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [termMonths, setTermMonths] = useState('12');
  const [status, setStatus] = useState<LoanStatus>('pending');

  useEffect(() => {
    if (!open) {
      setClientId('');
      setRequestedAmount('');
      setTermMonths('12');
      setStatus('pending');
    }
  }, [open]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!clientId || !requestedAmount) return;

    onSubmit({
      clientId: Number(clientId),
      requestedAmount: Number(requestedAmount),
      termMonths: Number(termMonths),
      status,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent open={open}>
        <DialogHeader>
          <div>
            <DialogTitle>Nueva solicitud de crédito</DialogTitle>
            <DialogDescription>Completa los datos para registrar la solicitud.</DialogDescription>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Cerrar"
            className="text-xl leading-none text-ak-subtle hover:text-ak-ink"
          >
            &times;
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="client">Cliente</Label>
            <Select id="client" value={clientId} onChange={(event) => setClientId(event.target.value)} required>
              <option value="" disabled>
                Selecciona un cliente
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.fullName}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="amount">Monto solicitado</Label>
              <div className="flex items-center gap-2 rounded-xl border border-ak-border px-3.5 focus-within:border-ak-accent-dark focus-within:ring-2 focus-within:ring-ak-accent/40">
                <span className="text-sm font-semibold text-ak-subtle">L</span>
                <input
                  id="amount"
                  type="number"
                  min="0.01"
                  max="9999999999.99"
                  step="0.01"
                  placeholder="0.00"
                  value={requestedAmount}
                  onChange={(event) => setRequestedAmount(event.target.value)}
                  required
                  className="h-11 w-full bg-transparent text-sm text-ak-ink outline-none placeholder:text-ak-subtle"
                />
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="term">Plazo</Label>
              <Select id="term" value={termMonths} onChange={(event) => setTermMonths(event.target.value)}>
                {TERM_OPTIONS.map((term) => (
                  <option key={term} value={term}>
                    {term} meses
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Estado</Label>
            <div className="flex gap-1 rounded-xl bg-ak-surface p-1">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value)}
                  className={cn(
                    'flex-1 rounded-lg py-2 text-[13px] font-semibold transition-colors',
                    status === option.value ? 'bg-ak-ink text-white' : 'text-ak-muted',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {status === 'approved' && (
            <div className="flex items-start gap-2.5 rounded-xl border border-[#dcf2c4] bg-[#f1fbe7] px-4 py-3.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ak-accent-dark" />
              <p className="text-[13px] leading-relaxed text-[#3f5c2b]">
                Si seleccionas <strong>&quot;Aprobada&quot;</strong>, se generará automáticamente el plan de cuotas
                dentro de la misma transacción.
              </p>
            </div>
          )}

          {errorMessage && <p className="text-sm font-medium text-ak-rejected-text">{errorMessage}</p>}

          <div className="mt-1 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creando…' : 'Crear solicitud'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
