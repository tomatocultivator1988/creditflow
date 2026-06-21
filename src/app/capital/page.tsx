"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Plus, Minus, Landmark, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ErrorMessage, LoadingBlock } from "@/components/ui-state";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { apiRequest } from "@/lib/client-api";
import { formatPeso } from "@/lib/money";
import type { CapitalTransactionDto } from "@/types/api";

const typeColors: Record<string, string> = {
  ADD: "text-emerald-600 bg-emerald-50 border-emerald-200",
  WITHDRAW: "text-rose-600 bg-rose-50 border-rose-200",
  LOAN: "text-amber-600 bg-amber-50 border-amber-200",
  COLLECTION: "text-emerald-600 bg-emerald-50 border-emerald-200",
  EXPENSE: "text-red-600 bg-red-50 border-red-200",
};

const typeIcons: Record<string, LucideIcon> = {
  ADD: ArrowUp,
  WITHDRAW: ArrowDown,
  LOAN: Minus,
  COLLECTION: Plus,
  EXPENSE: Minus,
};

export default function CapitalPage() {
  const router = useRouter();

  const [balance, setBalance] = useState("0.00");
  const [transactions, setTransactions] = useState<CapitalTransactionDto[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");

  // Add Cash modal
  const [addOpen, setAddOpen] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Withdraw modal
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDesc, setWithdrawDesc] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    const url = `/api/capital?page=${page}&limit=50` + (typeFilter ? `&type=${typeFilter}` : "");
    apiRequest<{ balance: string; transactions: CapitalTransactionDto[]; pagination: { totalPages: number } }>(url)
      .then((data) => { setBalance(data.balance); setTransactions(data.transactions); setTotalPages(data.pagination.totalPages); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [page, typeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  function openAddModal() { setAddOpen(true); setAddAmount(""); setAddDesc(""); setAddError(""); }
  function openWithdrawModal() { setWithdrawOpen(true); setWithdrawAmount(""); setWithdrawDesc(""); setWithdrawError(""); }

  async function handleAddSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddError(""); setAddLoading(true);
    try {
      await apiRequest("/api/capital", { method: "POST", body: JSON.stringify({ _action: "add", amount: addAmount, description: addDesc || undefined }) });
      setAddOpen(false);
      setPage(1);
      fetchData();
    } catch (err) { setAddError((err as Error).message); }
    finally { setAddLoading(false); }
  }

  async function handleWithdrawSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setWithdrawError(""); setWithdrawLoading(true);
    try {
      await apiRequest("/api/capital", { method: "POST", body: JSON.stringify({ _action: "withdraw", amount: withdrawAmount, description: withdrawDesc || undefined }) });
      setWithdrawOpen(false);
      setPage(1);
      fetchData();
    } catch (err) { setWithdrawError((err as Error).message); }
    finally { setWithdrawLoading(false); }
  }

  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Capital Management"
        description="Track capital balance and transactions"
        actions={
          <div className="flex gap-2">
            <button onClick={openAddModal} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 active:scale-[0.98]">
              <Plus size={16} /> Add Cash
            </button>
            <button onClick={openWithdrawModal} className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-700 px-4 text-sm font-medium text-white shadow-sm hover:bg-rose-600 active:scale-[0.98]">
              <Minus size={16} /> Withdraw
            </button>
          </div>
        }
      />

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 text-white">
            <Landmark size={20} />
          </span>
          <p className="text-sm font-medium text-white/70">Current Capital Balance</p>
        </div>
        <p className="text-4xl font-bold tracking-tight text-white">{formatPeso(balance)}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["", "ADD", "WITHDRAW", "LOAN", "COLLECTION", "EXPENSE"].map((t) => (
          <button
            key={t}
            onClick={() => { setTypeFilter(t); setPage(1); }}
            className={`inline-flex h-9 items-center rounded-xl px-4 text-xs font-semibold transition-all ${
              typeFilter === t
                ? "bg-red-800 text-white shadow-sm"
                : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t || "All"}
          </button>
        ))}
      </div>

      {loading ? <LoadingBlock label="Loading transactions" /> : null}

      {!loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {transactions.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-slate-400">No capital transactions yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {transactions.map((tx) => {
                const Icon = typeIcons[tx.type] || Landmark;
                return (
                  <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50">
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${typeColors[tx.type] || "text-slate-600 bg-slate-50 border-slate-200"}`}>
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">{tx.description || tx.type}</p>
                      <p className="text-xs text-slate-500">{tx.type} · {new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${tx.type === "ADD" || tx.type === "COLLECTION" ? "text-emerald-600" : "text-rose-600"}`}>
                        {tx.type === "ADD" || tx.type === "COLLECTION" ? "+" : "-"}{formatPeso(tx.amount)}
                      </p>
                      <p className="text-xs text-slate-400">Balance: {formatPeso(tx.balanceAfter)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      ) : null}

      {/* Add Cash Modal */}
      {addOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setAddOpen(false)}>
          <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Add Cash to Capital</h2>
                <p className="mt-0.5 text-sm text-slate-500">Record additional cash injection into the business capital.</p>
              </div>
              <button onClick={() => setAddOpen(false)} className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X size={18} /></button>
            </div>
            {addError ? <div className="flex-shrink-0 mx-6 mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{addError}</div> : null}
            <form id="add-capital-form" onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto space-y-4 px-6 py-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Amount *</label>
                <input required type="number" step="0.01" min="0.01" max="999999999999" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} placeholder="0.00" className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <input value={addDesc} onChange={(e) => setAddDesc(e.target.value)} placeholder="e.g. Additional investment" className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </div>
            </form>
            <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button type="button" onClick={() => setAddOpen(false)} className="min-h-[44px] sm:min-h-0 w-full sm:w-auto inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 px-6 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98]">Cancel</button>
              <button type="submit" form="add-capital-form" disabled={addLoading} className="min-h-[44px] sm:min-h-0 w-full sm:w-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 active:scale-[0.98] disabled:bg-slate-300"><Plus size={16} /> {addLoading ? "Adding..." : "Add Capital"}</button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Withdraw Modal */}
      {withdrawOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setWithdrawOpen(false)}>
          <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Withdraw Capital</h2>
                <p className="mt-0.5 text-sm text-slate-500">Record capital withdrawal from the business.</p>
              </div>
              <button onClick={() => setWithdrawOpen(false)} className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X size={18} /></button>
            </div>
            {withdrawError ? <div className="flex-shrink-0 mx-6 mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{withdrawError}</div> : null}
            <form id="withdraw-capital-form" onSubmit={handleWithdrawSubmit} className="flex-1 overflow-y-auto space-y-4 px-6 py-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Amount *</label>
                <input required type="number" step="0.01" min="0.01" max="999999999999" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0.00" className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Purpose / Description</label>
                <input value={withdrawDesc} onChange={(e) => setWithdrawDesc(e.target.value)} placeholder="e.g. Owner's draw" className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </div>
            </form>
            <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button type="button" onClick={() => setWithdrawOpen(false)} className="min-h-[44px] sm:min-h-0 w-full sm:w-auto inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 px-6 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98]">Cancel</button>
              <button type="submit" form="withdraw-capital-form" disabled={withdrawLoading} className="min-h-[44px] sm:min-h-0 w-full sm:w-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-700 px-6 text-sm font-medium text-white shadow-sm hover:bg-rose-600 active:scale-[0.98] disabled:bg-slate-300"><Minus size={16} /> {withdrawLoading ? "Processing..." : "Withdraw"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
