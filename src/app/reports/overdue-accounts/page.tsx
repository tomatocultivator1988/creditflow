"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Printer } from "lucide-react";
import { ErrorMessage, LoadingBlock } from "@/components/ui-state";
import { PageHeader } from "@/components/page-header";
import type { LoanStatusValue } from "@/types/api";
import { StatusBadge } from "@/components/status-badge";
import { ResponsiveTable } from "@/components/responsive-table";
import { Pagination } from "@/components/pagination";
import { apiRequest } from "@/lib/client-api";
import { formatPeso } from "@/lib/money";
import { downloadCsv } from "@/lib/export-csv";

type OverdueAccountRow = {
  id: string;
  customerName: string;
  customerPhone: string;
  principal: string;
  dailyInstallment: string;
  remainingBalance: string;
  nextDueDate: string | null;
  status: LoanStatusValue;
  daysOverdue: number;
  lastPaymentDate: string | null;
  lastPaymentAmount: string | null;
};

export default function OverdueAccountsPage() {
  const [accounts, setAccounts] = useState<OverdueAccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const url = `/api/reports/overdue-accounts?page=${page}&limit=50` + (selectedDate ? `&date=${selectedDate}` : "");
    apiRequest<{ accounts: OverdueAccountRow[]; pagination: { totalPages: number } }>(url)
      .then((data) => { setAccounts(data.accounts); setTotalPages(data.pagination?.totalPages || 1); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, [selectedDate, page]);

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.remainingBalance), 0);
  const totalOverdue = accounts.filter((a) => a.daysOverdue > 0).length;

  function handlePrint() { window.print(); }

  function handleExport() {
    const rows = accounts.map((a) => [
      a.customerName, a.customerPhone, a.principal, a.dailyInstallment,
      a.remainingBalance, a.nextDueDate || "", String(a.daysOverdue), a.status,
    ]);
    downloadCsv("overdue-accounts.csv",
      ["Customer", "Phone", "Principal", "Daily", "Balance", "Due Date", "Overdue Days", "Status"],
      rows,
    );
  }

  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Due Date Monitoring" description="All active accounts sorted by due date. Filter by date to see who has paid and who hasn't." />
        <div className="flex gap-2 print:hidden">
          <button onClick={handleExport} className="inline-flex min-h-[44px] sm:min-h-0 h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98]">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={handlePrint} className="inline-flex min-h-[44px] sm:min-h-0 h-10 items-center gap-2 rounded-xl bg-red-800 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:scale-[0.98]">
            <Printer size={15} /> Print
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <span className="text-xs font-semibold text-slate-500">Due on or before:</span>
        <input type="date" value={selectedDate}
          onChange={(e) => { setSelectedDate(e.target.value); setPage(1); }}
          className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
        {selectedDate ? (
          <button onClick={() => { setSelectedDate(""); setPage(1); }}
            className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-600 hover:bg-slate-50">
            Clear Filter
          </button>
        ) : null}
      </div>

      {loading ? <LoadingBlock /> : null}

      {!loading ? (
        <>
          <div className="flex flex-wrap gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filtered Accounts</p>
              <p className="mt-1.5 text-xl font-bold text-slate-900">{accounts.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Overdue</p>
              <p className="mt-1.5 text-xl font-bold text-rose-700">{totalOverdue}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Balance</p>
              <p className="mt-1.5 text-xl font-bold text-slate-900">{formatPeso(totalBalance.toFixed(2))}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <ResponsiveTable<OverdueAccountRow>
              columns={[
                {
                  key: "customer",
                  label: "Customer",
                  render: (a) => (
                    <Link href={`/loans/${a.id}`} className="font-medium text-red-800 hover:text-red-600 hover:underline">{a.customerName}</Link>
                  ),
                },
                {
                  key: "phone",
                  label: "Contact",
                  render: (a) => a.customerPhone,
                  hideOnMobile: true,
                },
                {
                  key: "nextDueDate",
                  label: "Due Date",
                  render: (a) => a.nextDueDate || "N/A",
                },
                {
                  key: "status",
                  label: "Status",
                  render: (a) => <StatusBadge status={a.status} />,
                },
                {
                  key: "balance",
                  label: "Balance",
                  render: (a) => <span className="font-semibold text-slate-900">{formatPeso(a.remainingBalance)}</span>,
                },
                {
                  key: "daily",
                  label: "Daily",
                  render: (a) => <span>{formatPeso(a.dailyInstallment)}<span className="text-slate-400 text-[10px] ml-0.5">/day</span></span>,
                  hideOnMobile: true,
                },
                {
                  key: "lastPayment",
                  label: "Last Payment",
                  render: (a) => a.lastPaymentDate
                    ? <span className="text-xs">{a.lastPaymentDate}<br /><span className="text-slate-500">{formatPeso(a.lastPaymentAmount!)}</span></span>
                    : <span className="text-slate-400">—</span>,
                  hideOnMobile: true,
                },
                {
                  key: "overdue",
                  label: "Days Overdue",
                  render: (a) => a.daysOverdue > 0
                    ? <span className="font-semibold text-rose-600">{a.daysOverdue}d overdue</span>
                    : <span className="text-slate-400">—</span>,
                  hideOnMobile: true,
                },
              ]}
              data={accounts}
              emptyMessage="No accounts found for this date."
              mobileAccordion={{ summaryColumns: ["customer", "status"] }}
            />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="m-4" />
          </div>
        </>
      ) : null}
    </div>
  );
}
