export type LoanStatus = 'pending' | 'approved' | 'rejected';

export interface LoanApplication {
  id: number;
  clientName: string;
  requestedAmount: number;
  termMonths: number;
  status: LoanStatus;
  createdAt: string;
}

export interface ClientOption {
  id: number;
  fullName: string;
}
