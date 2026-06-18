"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { ErrorMessage, LoadingBlock } from "@/components/ui-state";
import { StatusBadge } from "@/components/status-badge";
import { apiRequest } from "@/lib/client-api";
import { formatPeso } from "@/lib/money";
import type { LoanAccountDto, PaymentDto, ScheduleStatusValue } from "@/types/api";

type ScheduleRow = {
  id: string;
  loanAccountId: string;
  periodNumber: number;
  amount: string;
  dueDate: string;
  status: ScheduleStatusValue;
  paidDate: string | null;
  paymentId: string | null;
  paidAmount: string | null;
  daysOverdue: number | null;
};

type StatementData = {
  generatedAt: string;
  loanAccount: LoanAccountDto;
  schedule: ScheduleRow[];
  payments: PaymentDto[];
  totalPayments: string;
};

const scheduleRowBg: Record<string, string> = {
  PAID: "bg-emerald-50/50",
  OVERDUE: "bg-rose-50/50",
  PARTIAL: "bg-amber-50/50",
  PENDING: "",
};

const scheduleCardBorder: Record<string, string> = {
  PAID: "border-emerald-200 bg-emerald-50/50",
  OVERDUE: "border-rose-200 bg-rose-50/50",
  PARTIAL: "border-amber-200 bg-amber-50/50",
  PENDING: "border-slate-200",
};

export default function StatementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<StatementData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<{ statement: StatementData }>(`/api/loans/${id}/statement`)
      .then((res) => setData(res.statement))
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return (
    <div className="p-8">
      <ErrorMessage message={error} />
      <Link href={`/loans/${id}`} className="text-sm text-red-700 underline mt-4 inline-block">Back to Loan</Link>
    </div>
  );

  if (!data) return <LoadingBlock label="Generating statement..." />;

  const a = data.loanAccount;

  const todayManila = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const unpaidSchedule = data.schedule.filter((s) => s.status !== "PAID");
  const totalDue = unpaidSchedule.reduce(
    (sum, s) => sum + parseFloat(s.amount) - (parseFloat(s.paidAmount || "0")),
    0,
  );

  const dueToday = data.schedule.filter(
    (s) => s.status !== "PAID" && s.dueDate <= todayManila,
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 print:px-0 print:py-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Link href={`/loans/${id}`} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
          <ArrowLeft size={16} /> Back to Loan
        </Link>
        <button onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-800 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700">
          <Printer size={16} /> Print PDF
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm print:border-none print:shadow-none">
        {/* Header */}
        <div className="border-b border-slate-200 px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Account Statement</h1>
              <p className="mt-1 text-sm text-slate-500">JBV Credit Collection Services — Cash Lending System</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Generated: {data.generatedAt}</div>
              <div className="mt-0.5">Status: <StatusBadge status={a.status} nextDueDate={a.nextDueDate} /></div>
              <div className="mt-0.5 text-xs">
                Release: {a.released
                  ? <span className="text-emerald-600 font-semibold">Released · {a.releasedAt ? new Date(a.releasedAt).toLocaleDateString() : ""}</span>
                  : <span className="text-amber-600 font-semibold">Unreleased</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Loan Details */}
        <div className="grid gap-6 px-8 py-5 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Customer</h2>
            <div className="space-y-1.5 text-sm">
              <div><span className="text-slate-500">Name:</span> <span className="font-medium text-slate-900">{a.customerName}</span></div>
              <div><span className="text-slate-500">Contact:</span> <span className="text-slate-700">{a.customerPhone}</span></div>
              {a.customerEmail ? <div><span className="text-slate-500">Email:</span> <span className="text-slate-700">{a.customerEmail}</span></div> : null}
              <div><span className="text-slate-500">Address:</span> <span className="text-slate-700">{a.customerAddress}</span></div>
              {a.fbLink ? <div><span className="text-slate-500">Facebook:</span> <span className="text-slate-700 break-all">{a.fbLink}</span></div> : null}
            </div>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Loan Details</h2>
            <div className="space-y-1.5 text-sm">
              <div><span className="text-slate-500">Principal:</span> <span className="font-medium text-slate-900">{formatPeso(a.principal)}</span></div>
              <div><span className="text-slate-500">Interest ({a.interestRate}%):</span> <span className="text-slate-700">{formatPeso(a.interestAmount)}</span></div>
              <div><span className="text-slate-500">Total Payable:</span> <span className="text-slate-700">{formatPeso(a.totalPayable)}</span></div>
              <div><span className="text-slate-500">Daily Installment:</span> <span className="text-slate-700">{formatPeso(a.dailyInstallment)}</span></div>
              <div><span className="text-slate-500">Term:</span> <span className="text-slate-700">{a.termDays} days</span></div>
              <div><span className="text-slate-500">Start Date:</span> <span className="text-slate-700">{a.startDate}</span></div>
              <div><span className="text-slate-500">End Date:</span> <span className="text-slate-700">{a.endDate}</span></div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="border-t border-slate-100 px-8 py-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Payment Summary</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-slate-500">Total Paid:</span> <span className="font-semibold text-emerald-700">{formatPeso(data.totalPayments)}</span></div>
            <div><span className="text-slate-500">Remaining:</span> <span className="font-semibold text-slate-900">{formatPeso(a.remainingBalance)}</span></div>
            <div><span className="text-slate-500">Total Due:</span> <span className="font-semibold text-red-800">{formatPeso(totalDue.toFixed(2))}</span></div>
          </div>
        </div>

        {/* Payment History */}
        <div className="border-t border-slate-100 px-4 sm:px-8 py-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Payment History ({data.payments.length})</h2>
          {data.payments.length > 0 ? (
            <>
              {/* Mobile: Cards */}
              <div className="block sm:hidden space-y-2">
                {data.payments.map((p) => (
                  <div key={p.id} className="rounded-lg border border-slate-200 bg-white p-3 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date</span>
                      <span className="font-medium">{p.paymentDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Amount</span>
                      <span className="font-semibold text-emerald-700">{formatPeso(p.amount)}</span>
                    </div>
                    {p.notes ? (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Notes</span>
                        <span className="text-slate-600">{p.notes}</span>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
              {/* Desktop: Table */}
              <div className="hidden sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                      <th className="py-2 pr-3 font-medium">Date</th>
                      <th className="py-2 pr-3 font-medium text-right">Amount</th>
                      <th className="py-2 pr-3 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.payments.map((p) => (
                      <tr key={p.id} className="border-b border-slate-100 text-slate-700">
                        <td className="py-2 pr-3">{p.paymentDate}</td>
                        <td className="py-2 pr-3 text-right font-medium">{formatPeso(p.amount)}</td>
                        <td className="py-2 pr-3 text-xs text-slate-500">{p.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400">No payments recorded.</p>
          )}
        </div>

        {/* Installment Schedule */}
        <div className="border-t border-slate-100 px-4 sm:px-8 py-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Installment Schedule ({data.schedule.length} periods)</h2>

          {/* Mobile: Cards */}
          <div className="block sm:hidden space-y-1.5">
            {data.schedule.map((s) => (
              <div key={s.id} className={`rounded-lg border p-2.5 text-xs space-y-1 ${scheduleCardBorder[s.status] || ""}`}>
                <div className="flex justify-between">
                  <span className="text-slate-500">#{s.periodNumber} · {s.dueDate}</span>
                  <StatusBadge status={s.status} />
                </div>
                {s.daysOverdue != null && s.daysOverdue > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Days</span>
                    <span className="text-rose-600 font-medium">{s.daysOverdue}d</span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-semibold">{formatPeso(s.amount)}</span>
                </div>
                {s.paidAmount ? (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Paid</span>
                    <span className="text-emerald-600">{formatPeso(s.paidAmount)}</span>
                  </div>
                ) : null}
                {s.status === "PARTIAL" && s.paidAmount ? (
                  <div className="flex justify-between border-t border-amber-100 pt-1">
                    <span className="text-slate-500">Remaining</span>
                    <span className="font-semibold text-amber-700">{formatPeso((parseFloat(s.amount) - parseFloat(s.paidAmount)).toFixed(2))}</span>
                  </div>
                ) : null}
              </div>
            ))}
            {unpaidSchedule.length > 0 ? (
              <div className="rounded-lg border-2 border-slate-300 bg-slate-50 p-3 text-xs space-y-2 mt-3">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-700">Total Due</span>
                  <span className="text-sm text-red-800">{formatPeso(totalDue.toFixed(2))}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-slate-200 pt-2">
                  <span className="text-slate-500">Remaining Balance</span>
                  <span className="text-sm text-slate-900">{formatPeso(a.remainingBalance)}</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Desktop: Table */}
          <div className="hidden sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                  <th className="py-2 pr-3 font-medium">#</th>
                  <th className="py-2 pr-3 font-medium">Due Date</th>
                  <th className="py-2 pr-3 font-medium text-right">Days</th>
                  <th className="py-2 pr-3 font-medium text-right">Amount</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Paid Date</th>
                  <th className="py-2 pr-3 font-medium text-right">Paid</th>
                </tr>
              </thead>
              <tbody>
                {data.schedule.map((s) => (
                  <tr key={s.id} className={`border-b border-slate-100 text-slate-700 ${scheduleRowBg[s.status] || ""}`}>
                    <td className="py-1.5 pr-3 font-medium">{s.periodNumber}</td>
                    <td className="py-1.5 pr-3">{s.dueDate}</td>
                    <td className="py-1.5 pr-3 text-right">
                      {s.daysOverdue != null && s.daysOverdue > 0 ? (
                        <span className="text-rose-600 font-medium">{s.daysOverdue}d</span>
                      ) : "—"}
                    </td>
                    <td className="py-1.5 pr-3 text-right">{formatPeso(s.amount)}</td>
                    <td className="py-1.5 pr-3"><StatusBadge status={s.status} /></td>
                    <td className="py-1.5 pr-3">{s.paidDate || "—"}</td>
                    <td className="py-1.5 pr-3 text-right">{s.paidAmount ? formatPeso(s.paidAmount) : "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 text-xs">
                  <td colSpan={6} className="py-2 pr-3 font-semibold text-slate-600 text-right">Total Due</td>
                  <td className="py-2 pr-3 text-right font-bold text-red-800 text-sm">
                    {formatPeso(totalDue.toFixed(2))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Total Amount Due (due on/before today) */}
        {dueToday.length > 0 ? (
          <div className="border-t-2 border-red-200 px-4 sm:px-8 py-5 print:border-red-300 bg-red-50/30">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-red-700 mb-3">
              Total Amount Due ({dueToday.length} period{dueToday.length > 1 ? "s" : ""} due on or before today)
            </h2>

            {/* Mobile: Cards */}
            <div className="block sm:hidden space-y-2">
              {dueToday.map((s) => (
                <div key={s.id} className="rounded-lg border border-red-100 bg-white p-3 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">#{s.periodNumber} · {s.dueDate}</span>
                    <span className="font-semibold text-red-800">{formatPeso((parseFloat(s.amount) - (parseFloat(s.paidAmount || "0"))).toFixed(2))}</span>
                  </div>
                  {s.daysOverdue != null && s.daysOverdue > 0 ? (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Days</span>
                      <span className="text-rose-600 font-medium">{s.daysOverdue}d</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount</span>
                    <span>{formatPeso(s.amount)}</span>
                  </div>
                  {s.paidAmount && s.status === "PARTIAL" ? (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Paid</span>
                      <span className="text-emerald-600">{formatPeso(s.paidAmount)}</span>
                    </div>
                  ) : null}
                </div>
              ))}
              <div className="text-center text-sm font-bold text-red-800 pt-1">
                Total Due: {formatPeso(dueToday.reduce((sum, s) => sum + parseFloat(s.amount) - (parseFloat(s.paidAmount || "0")), 0).toFixed(2))}
              </div>
              <div className="text-center text-xs font-semibold text-slate-500 pt-1">
                Remaining Balance: <span className="text-slate-900">{formatPeso(a.remainingBalance)}</span>
              </div>
            </div>

            {/* Desktop: Table */}
            <div className="hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-red-100 text-left text-xs text-slate-500">
                    <th className="py-2 pr-3 font-medium">#</th>
                    <th className="py-2 pr-3 font-medium">Due Date</th>
                    <th className="py-2 pr-3 font-medium text-right">Days</th>
                    <th className="py-2 pr-3 font-medium text-right">Amount</th>
                    <th className="py-2 pr-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dueToday.map((s) => (
                    <tr key={s.id} className="border-b border-red-100 text-slate-700">
                      <td className="py-1.5 pr-3">{s.periodNumber}</td>
                      <td className="py-1.5 pr-3">{s.dueDate}</td>
                      <td className="py-1.5 pr-3 text-right">
                        {s.daysOverdue != null && s.daysOverdue > 0 ? (
                          <span className="text-rose-600">{s.daysOverdue}d</span>
                        ) : "—"}
                      </td>
                      <td className="py-1.5 pr-3 text-right">{formatPeso(s.amount)}</td>
                      <td className="py-1.5 pr-3 text-right font-semibold text-red-800">
                        {formatPeso((parseFloat(s.amount) - (parseFloat(s.paidAmount || "0"))).toFixed(2))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold text-red-800">
                    <td colSpan={4} className="pt-2 pr-3 text-right">Total Due:</td>
                    <td className="pt-2 pr-3 text-right">
                      {formatPeso(dueToday.reduce((sum, s) => sum + parseFloat(s.amount) - (parseFloat(s.paidAmount || "0")), 0).toFixed(2))}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="pt-1 pr-3 text-right text-xs font-semibold text-slate-500">Remaining Balance:</td>
                    <td className="pt-1 pr-3 text-right text-xs font-bold text-slate-900">{formatPeso(a.remainingBalance)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="border-t border-slate-200 px-8 py-4 text-center text-xs text-slate-400">
          JBV Credit Collection Services — Cash Lending System — {data.generatedAt}
        </div>
      </div>
    </div>
  );
}
