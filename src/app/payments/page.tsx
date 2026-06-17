"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ErrorMessage, LoadingBlock } from "@/components/ui-state";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { ResponsiveTable } from "@/components/responsive-table";
import { apiRequest } from "@/lib/client-api";
import { formatPeso } from "@/lib/money";
import type { PaymentDto } from "@/types/api";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<{ payments: PaymentDto[]; pagination: { page: number; totalPages: number } }>(`/api/payments?page=${page}&limit=20`)
      .then((data) => { setPayments(data.payments); setTotalPages(data.pagination.totalPages); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page]);

  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Payments" description="All recorded payments" />
        <Link href="/payments/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-800 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700">
          <Plus size={16} /> New Payment
        </Link>
      </div>

      {loading ? (
        <LoadingBlock />
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <ResponsiveTable<PaymentDto>
              columns={[
                {
                  key: "date",
                  label: "Date",
                  render: (p) => <span>{p.paymentDate}</span>,
                },
                {
                  key: "customer",
                  label: "Customer",
                  render: (p) => (
                    <Link href={`/loans/${p.loanAccountId}`} className="font-medium text-slate-900 hover:text-red-700">{p.customerName}</Link>
                  ),
                },
                {
                  key: "amount",
                  label: "Amount",
                  render: (p) => <span className="font-medium text-emerald-600">{formatPeso(p.amount)}</span>,
                },
                {
                  key: "notes",
                  label: "Notes",
                  hide: "sm",
                  render: (p) => <span className="text-slate-500">{p.notes || "—"}</span>,
                },
              ]}
              data={payments}
              emptyMessage="No payments found"
            />
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
