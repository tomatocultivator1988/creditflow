"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Printer } from "lucide-react";
import { ErrorMessage, LoadingBlock } from "@/components/ui-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { ResponsiveTable } from "@/components/responsive-table";
import { apiRequest } from "@/lib/client-api";
import { formatPeso } from "@/lib/money";
import { downloadCsv } from "@/lib/export-csv";
import type { LoanAccountDto } from "@/types/api";

export default function OverdueAccountsPage() {
  const [accounts, setAccounts] = useState<LoanAccountDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<{ accounts: LoanAccountDto[] }>("/api/reports/overdue-accounts")
      .then((data) => setAccounts(data.accounts))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.remainingBalance), 0);

  function overdueDays(nextDueDate: string): number {
    const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
    const diffMs = new Date(todayStr).getTime() - new Date(nextDueDate).getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  function handlePrint() { window.print(); }

  function handleExport() {
    const rows = accounts.map((a) => [
      a.customerName, a.principal, a.dailyInstallment,
      a.remainingBalance, String(overdueDays(a.nextDueDate)), a.status,
    ]);
    downloadCsv("overdue-accounts.csv",
      ["Customer", "Principal", "Daily", "Balance", "Overdue Days", "Status"],
      rows,
    );
  }

  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Overdue Accounts" description="All overdue loan accounts" />
        <div className="flex gap-2 print:hidden">
          <button onClick={handleExport} className="inline-flex min-h-[44px] sm:min-h-0 h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98]">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={handlePrint} className="inline-flex min-h-[44px] sm:min-h-0 h-10 items-center gap-2 rounded-xl bg-red-800 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:scale-[0.98]">
            <Printer size={15} /> Print
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingBlock />
      ) : (
        <>
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            Total Overdue Balance: {formatPeso(totalBalance.toFixed(2))} ({accounts.length} accounts)
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <ResponsiveTable<LoanAccountDto>
              columns={[
                {
                  key: "customer",
                  label: "Customer",
                  render: (a) => (
                    <Link href={`/loans/${a.id}`} className="font-medium text-slate-900 hover:text-red-700">{a.customerName}</Link>
                  ),
                },
                {
                  key: "principal",
                  label: "Principal",
                  render: (a) => <span>{formatPeso(a.principal)}</span>,
                },
                {
                  key: "daily",
                  label: "Daily",
                  hide: "sm",
                  render: (a) => <span>{formatPeso(a.dailyInstallment)}</span>,
                },
                {
                  key: "balance",
                  label: "Balance",
                  render: (a) => <span className="font-medium text-red-700">{formatPeso(a.remainingBalance)}</span>,
                },
                {
                  key: "overdue",
                  label: "Overdue",
                  render: (a) => <span className="font-medium text-rose-600">{overdueDays(a.nextDueDate)}d</span>,
                },
                {
                  key: "status",
                  label: "Status",
                  render: (a) => <StatusBadge status={a.status} nextDueDate={a.nextDueDate} />,
                },
              ]}
              data={accounts}
              emptyMessage="No overdue accounts"
            />
          </div>
        </>
      )}
    </div>
  );
}
