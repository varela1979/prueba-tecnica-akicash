import { Badge } from '@/components/ui/badge';
import type { LoanStatus } from '@/types/loan-application';

const STATUS_LABEL: Record<LoanStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

export function StatusBadge({ status }: { status: LoanStatus }) {
  return <Badge status={status}>{STATUS_LABEL[status]}</Badge>;
}
