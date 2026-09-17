import { fetchLoanApplications } from "@/api/loanApplications";
import type { StatusFilterValue } from "@/components/loan-applications/StatusFilterPills";
import type { LoanApplication } from "@/types/loan-application";
import { useEffect, useState } from "react";

export function useLoanApplications(params: {
    status: StatusFilterValue;
    from: string;
    until: string;
    search: string;
    page: number;
    limit: number;
}){
    const [loans, setLoans] = useState<LoanApplication[]>([]);
    const [loading, setLoading] =useState(true);
    const [error, setError]= useState<string | null>(null);
    const [totalResults, setTotalResults] = useState(0);
    const [refreshIndex, setRefreshIndex] = useState(0);

    useEffect(() => {
    let ignore = false;

    async function load() {
        setLoading(true);
        setError(null);

        try {
        const result = await fetchLoanApplications({
            page: params.page,
            limit: params.limit,
            status: params.status === 'all' ? undefined : params.status,
            from: params.from || undefined,
            until: params.until || undefined,
            search: params.search || undefined,
        });

        if (ignore) return;

        setLoans(result.data);
        setTotalResults(result.meta.total);
        } catch (err) {
        if (ignore) return;

        setError(
            err instanceof Error
            ? err.message
            : 'Ocurrió un error inesperado.',
        );
        } finally {
        if (!ignore) {
            setLoading(false);
        }
        }
    }

    void load();

    return () => {
        ignore = true;
    };
    }, [
    params.status,
    params.from,
    params.until,
    params.search,
    params.page,
    params.limit,
    refreshIndex,
    ]);
    
    function refetch() {
        setRefreshIndex((prev) => prev + 1);
    }


    return {loans, loading, error, totalResults, refetch};
}