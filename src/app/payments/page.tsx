"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import { ErrorMessage, LoadingBlock } from "@/components/ui-state";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { ResponsiveTable } from "@/components/responsive-table";
import { apiRequest } from "@/lib/client-api";
import { formatPeso } from "@/lib/money";
import type { PaymentDto, LoanAccountDto } from "@/types/api";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // New Payment modal
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LoanAccountDto[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanAccountDto | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payNotes, setPayNotes] = useState("");
  const [payError, setPayError] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  const fetchPayments = () => {
    setLoading(true);
    apiRequest<{ payments: PaymentDto[]; pagination: { page: number; totalPages: number } }>(`/api/payments?page=${page}&limit=20`)
      .then((data) => { setPayments(data.payments); setTotalPages(data.pagination.totalPages); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, [page]);

  function openModal() {
    setModalOpen(true);
    setSearchQuery(""); setSearchResults([]); setSelectedLoan(null);
    setPayAmount(""); setPayNotes(""); setPayError("");
    setPayDate(new Date().toISOString().slice(0, 10));
  }

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      apiRequest<{ loanAccounts: LoanAccountDto[] }>(`/api/loans?search=${encodeURIComponent(searchQuery)}&limit=5`)
        .then((data) => setSearchResults(data.loanAccounts.filter((l) => l.status !== "FULLY_PAID")))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  function selectLoan(loan: LoanAccountDto) {
    setSelectedLoan(loan);
    setSearchQuery(loan.customerName);
    setSearchResults([]);
    setPayAmount(loan.dailyInstallment || "");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedLoan) { setPayError("Please select a loan first"); return; }
    setPayError(""); setPayLoading(true);
    try {
      await apiRequest("/api/payments", {
        method: "POST",
        body: JSON.stringify({
          loanAccountId: selectedLoan.id,
          amount: payAmount,
          paymentDate: payDate,
          notes: payNotes || undefined,
        }),
      });
      setModalOpen(false);
      setPage(1);
      fetchPayments();
    } catch (err) { setPayError((err as Error).message); }
    finally { setPayLoading(false); }
  }

  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Payments" description="All recorded payments" />
        <button onClick={openModal} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-800 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700">
          <Plus size={16} /> New Payment
        </button>
      </div>

      {loading ? (
        <LoadingBlock />
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <ResponsiveTable<PaymentDto>
              columns={[
                { key: "date", label: "Date", render: (p) => <span>{p.paymentDate}</span> },
                { key: "customer", label: "Customer", render: (p) => (<Link href={`/loans/${p.loanAccountId}`} className="font-medium text-slate-900 hover:text-red-700">{p.customerName}</Link>) },
                { key: "amount", label: "Amount", render: (p) => <span className="font-medium text-emerald-600">{formatPeso(p.amount)}</span> },
                { key: "notes", label: "Notes", hide: "sm", render: (p) => <span className="text-slate-500">{p.notes || "—"}</span> },
              ]}
              data={payments}
              emptyMessage="No payments found"
            />
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* New Payment Modal */}
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">New Payment</h2>
                <p className="mt-0.5 text-sm text-slate-500">Record a cash payment</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X size={18} /></button>
            </div>
            {payError ? <div className="flex-shrink-0 mx-6 mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{payError}</div> : null}
            <form id="new-payment-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 px-6 py-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Search Customer *</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); if (selectedLoan && e.target.value !== selectedLoan.customerName) setSelectedLoan(null); }}
                    placeholder="Type customer name..."
                    className="h-10 w-full rounded-xl border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>
                {searchResults.length > 0 && !selectedLoan ? (
                  <div className="mt-1 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                    {searchResults.map((l) => (
                      <button key={l.id} type="button" onClick={() => selectLoan(l)}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-red-50 transition-colors border-b border-slate-100 last:border-0">
                        <div className="text-left">
                          <span className="font-medium text-slate-900">{l.customerName}</span>
                          <span className="text-xs text-slate-500 ml-2">{l.customerPhone}</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{formatPeso(l.remainingBalance)}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
                {searching ? <p className="mt-1 text-xs text-slate-400">Searching...</p> : null}
                {searchQuery.length >= 2 && !searching && searchResults.length === 0 && !selectedLoan ? (
                  <p className="mt-1 text-xs text-slate-400">No active loans found</p>
                ) : null}
              </div>
              {selectedLoan ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs space-y-1">
                  <p className="font-semibold text-emerald-800">{selectedLoan.customerName}</p>
                  <p className="text-slate-600">{selectedLoan.customerPhone} · {selectedLoan.termDays} days</p>
                  <p className="text-slate-600">Balance: <span className="font-semibold">{formatPeso(selectedLoan.remainingBalance)}</span> · Daily: <span className="font-semibold">{formatPeso(selectedLoan.dailyInstallment)}</span></p>
                  <p className="text-slate-600">Status: <span className={selectedLoan.status === "OVERDUE" ? "text-rose-600 font-semibold" : "text-emerald-600 font-semibold"}>{selectedLoan.status}</span></p>
                </div>
              ) : null}
              <div>
                <label className="block text-sm font-medium text-slate-700">Amount *</label>
                <input required type="number" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="0.00" className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
                {selectedLoan && payAmount && parseFloat(payAmount) > parseFloat(selectedLoan.remainingBalance) ? (
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-xs text-amber-600">Amount exceeds remaining balance</span>
                    <button type="button" onClick={() => setPayAmount(selectedLoan.remainingBalance)} className="text-xs font-medium text-red-700 hover:underline">Set exact</button>
                  </div>
                ) : null}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Payment Date *</label>
                <input required type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Notes</label>
                <input value={payNotes} onChange={(e) => setPayNotes(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </div>
            </form>
            <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button type="button" onClick={() => setModalOpen(false)} className="min-h-[44px] sm:min-h-0 w-full sm:w-auto inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 px-6 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98]">Cancel</button>
              <button type="submit" form="new-payment-form" disabled={payLoading} className="min-h-[44px] sm:min-h-0 w-full sm:w-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-800 px-6 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:scale-[0.98] disabled:bg-slate-300">{payLoading ? "Saving..." : "Post Payment"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
