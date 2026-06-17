"use client";

import { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
import { ErrorMessage, LoadingBlock } from "@/components/ui-state";
import { PageHeader } from "@/components/page-header";
import { apiRequest } from "@/lib/client-api";
import { formatPeso } from "@/lib/money";
import { downloadCsv } from "@/lib/export-csv";
import type { PaymentDto } from "@/types/api";

export default function DailyCollectionsPage() {
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<{ payments: PaymentDto[]; date: string }>(
      `/api/reports/daily-collections?date=${date}`,
    )
      .then((data) => setPayments(data.payments))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [date]);

  const total = payments.reduce(
    (sum, p) => sum + parseFloat(p.amount),
    0,
  );

  function handlePrint() { window.print(); }

  function handleExport() {
    const rows = payments.map((p) => [p.paymentDate, p.customerName, p.amount, p.notes || ""]);
    downloadCsv(`daily-collections-${date}.csv`,
      ["Date", "Customer", "Amount", "Notes"],
      rows,
    );
  }

  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Daily Collections" description="Payment collections by date" />
        <div className="flex gap-2 print:hidden">
          <button onClick={handleExport} className="inline-flex min-h-[44px] sm:min-h-0 h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98]">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={handlePrint} className="inline-flex min-h-[44px] sm:min-h-0 h-10 items-center gap-2 rounded-xl bg-red-800 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:scale-[0.98]">
            <Printer size={15} /> Print
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700">Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
        />
      </div>

      {loading ? (
        <LoadingBlock />
      ) : (
        <>
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            Total: {formatPeso(total.toFixed(2))} ({payments.length} payments)
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Customer</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Amount</th>
                  <th className="hidden sm:table-cell px-4 py-3 font-medium text-slate-600">Notes</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                      No collections for this date
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">{p.paymentDate}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{p.customerName}</td>
                      <td className="px-4 py-3 font-medium text-emerald-600">{formatPeso(p.amount)}</td>
                      <td className="hidden sm:table-cell px-4 py-3 text-slate-500">{p.notes || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
