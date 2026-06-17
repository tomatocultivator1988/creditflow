"use client";

import { Suspense, FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ErrorMessage } from "@/components/ui-state";
import { PageHeader } from "@/components/page-header";
import { apiRequest } from "@/lib/client-api";
import { formatPeso } from "@/lib/money";
import type { LoanAccountDto } from "@/types/api";

function NewPaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedLoanId = searchParams.get("loanId") || "";

  const [loans, setLoans] = useState<LoanAccountDto[]>([]);
  const [loanAccountId, setLoanAccountId] = useState(preselectedLoanId);
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiRequest<{
      loanAccounts: LoanAccountDto[];
      pagination: { totalPages: number };
    }>("/api/loans?limit=100")
      .then((data) => setLoans(data.loanAccounts))
      .catch(() => {});
  }, []);

  const activeLoans = loans.filter((l) => l.status !== "FULLY_PAID");
  const selectedLoan = activeLoans.find((l) => l.id === loanAccountId);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiRequest("/api/payments", {
        method: "POST",
        body: JSON.stringify({
          loanAccountId,
          amount,
          paymentDate,
          notes: notes || undefined,
        }),
      });

      if (preselectedLoanId) {
        router.push(`/loans/${preselectedLoanId}`);
      } else {
        router.push("/payments");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader title="New Payment" description="Record a cash payment" />

      {error ? <ErrorMessage message={error} /> : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Select Loan *
            <select
              required
              value={loanAccountId}
              onChange={(e) => setLoanAccountId(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
            >
              <option value="">Select a loan...</option>
              {activeLoans.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.customerName} — {formatPeso(l.remainingBalance)} balance
                </option>
              ))}
            </select>
          </label>
          {selectedLoan ? (
            <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 space-y-1">
              <p>{selectedLoan.customerPhone} | {selectedLoan.termDays} days</p>
              <p>Balance: {formatPeso(selectedLoan.remainingBalance)} | Daily: {formatPeso(selectedLoan.dailyInstallment)}</p>
              <p>Status: <span className={selectedLoan.status === "OVERDUE" ? "text-rose-600 font-medium" : "text-emerald-600 font-medium"}>{selectedLoan.status}</span></p>
            </div>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Amount *
            <input
              required
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </label>
          {selectedLoan && amount && parseFloat(amount) > parseFloat(selectedLoan.remainingBalance) ? (
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-xs text-amber-600">Amount exceeds remaining balance of {formatPeso(selectedLoan.remainingBalance)}</span>
              <button type="button" onClick={() => setAmount(selectedLoan.remainingBalance)} className="text-xs font-medium text-red-700 hover:underline">Set exact</button>
            </div>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Payment Date *
            <input
              required
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Notes
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </label>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="min-h-[44px] sm:min-h-0 w-full sm:w-auto inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 px-6 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] sm:min-h-0 w-full sm:w-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-800 px-6 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:scale-[0.98] disabled:bg-slate-300"
          >
            {loading ? "Saving..." : "Post Payment"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewPaymentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
      <NewPaymentForm />
    </Suspense>
  );
}
