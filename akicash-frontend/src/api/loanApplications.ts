const API_BASE_URL = import.meta.env.VITE_API_URL;
export async function fetchLoanApplications(filters:{
    page: number;
    limit: number;
    status?: string;
    from?: string;
    until?: string;
    search?: string;
}) {
    const params = new URLSearchParams();
    params.set('page', String(filters.page));
    params.set('limit', String(filters.limit));

    if(filters.status) params.set('status', filters.status);
    if(filters.from) params.set('from', filters.from);
    if(filters.until) params.set('until', filters.until);
    if(filters.search) params.set('search', filters.search);

    const response = await fetch(`${API_BASE_URL}/loan-applications?${params}`);

    if(!response.ok)throw new Error('No se pudieron cargar las solicitudes.');

    const body = await response.json();

    const data = body.data.map((row: any) => ({
    id: row.id,
    clientName: row.client_name,
    requestedAmount: Number(row.requested_amount),
    termMonths: row.term_months,
    status: row.status,
    createdAt: row.created_at,
  }));

  return {
    data,
    meta: body.meta,
  };
}

export async function createLoanApplication(payload:{
    clientId: number;
    requestedAmount: number;
    termMonths: number;
    status: string;
}) {
    const response = await fetch(`${API_BASE_URL}/loan-applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: payload.clientId,
      requested_amount: payload.requestedAmount,
      term_months: payload.termMonths,
      status: payload.status,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? 'No se pudo crear la solicitud.');
  }

  return response.json();
}