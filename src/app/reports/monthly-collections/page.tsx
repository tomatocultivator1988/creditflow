"use client";

import { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
import { ErrorMessage, LoadingBlock } from "@/components/ui-state";
import { PageHeader } from "@/components/page-header";
import { apiRequest } from "@/lib/client-api";
import { formatPeso } from "@/lib/money";
import { downloadCsv } from "@/lib/export-csv";

type MonthlyRow = { month: number; total: string; count: number };

export default function MonthlyCollectionsPage() {
  const [data, setData] = useState<MonthlyRow[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<{ year: number; monthlyData: MonthlyRow[] }>(
      `/api/reports/monthly-collections?year=${year}`,
    )
      .then((d) => setData(d.monthlyData))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [year]);

  const grandTotal = data.reduce((sum, r) => sum + parseFloat(r.total), 0);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  function handlePrint() { window.print(); }

  function handleExport() {
    const rows = data.map((r) => [months[r.month - 1], r.total, String(r.count)]);
    downloadCsv(`monthly-collections-${year}.csv`,
      ["Month", "Collections", "Payments"],
      rows,
    );
  }

  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Monthly Collections" description="Monthly collection breakdown" />
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
        <label className="text-sm font-medium text-slate-700">Year:</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="h-10 w-28 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
        />
      </div>

      {loading ? (
        <LoadingBlock />
      ) : (
        <>
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            Grand Total: {formatPeso(grandTotal.toFixed(2))}
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Month</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Collections</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Payments</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.month} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">{months[r.month - 1]}</td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">{formatPeso(r.total)}</td>
                    <td className="px-4 py-3 text-slate-600">{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
