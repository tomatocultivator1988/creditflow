"use client";

import { useEffect, useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Receipt, X } from "lucide-react";
import { ErrorMessage, LoadingBlock } from "@/components/ui-state";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { apiRequest } from "@/lib/client-api";
import { formatPeso } from "@/lib/money";
import type { ExpenseDto } from "@/types/api";

export default function ExpensesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [expenses, setExpenses] = useState<ExpenseDto[]>([]);
  const [summary, setSummary] = useState({ salaryTotal: "0.00", otherTotal: "0.00", grandTotal: "0.00" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");

  // New Expense modal
  const [modalOpen, setModalOpen] = useState(false);
  const [expType, setExpType] = useState<"SALARY" | "OTHER">("SALARY");
  const [expAmount, setExpAmount] = useState("");
  const [expDesc, setExpDesc] = useState("");
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([]);
  const [expError, setExpError] = useState("");
  const [expLoading, setExpLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    const url = `/api/expenses?page=${page}&limit=50` + (typeFilter ? `&type=${typeFilter}` : "");
    apiRequest<{ expenses: ExpenseDto[]; summary: typeof summary; pagination: { totalPages: number } }>(url)
      .then((data) => { setExpenses(data.expenses); setSummary(data.summary); setTotalPages(data.pagination.totalPages); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [page, typeFilter, status, session]); // eslint-disable-line react-hooks/exhaustive-deps

  function openModal() {
    setModalOpen(true);
    setExpType("SALARY"); setExpAmount(""); setExpDesc("");
    setExpDate(new Date().toISOString().slice(0, 10));
    setCustomFields([]); setExpError("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setExpError(""); setExpLoading(true);
    try {
      const customFieldsObj = customFields
        .filter((f) => f.key.trim())
        .reduce((acc, f) => { acc[f.key.trim()] = f.value; return acc; }, {} as Record<string, string>);
      await apiRequest("/api/expenses", {
        method: "POST",
        body: JSON.stringify({
          type: expType,
          amount: expAmount,
          description: expDesc || undefined,
          date: expDate,
          customFields: Object.keys(customFieldsObj).length > 0 ? customFieldsObj : undefined,
        }),
      });
      setModalOpen(false);
      setPage(1);
      fetchData();
    } catch (err) { setExpError((err as Error).message); }
    finally { setExpLoading(false); }
  }

  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Track salary and other business expenses"
        actions={
          <button onClick={openModal} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-800 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:scale-[0.98]">
            <Plus size={16} /> New Expense
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Salary Expenses</p>
          <p className="mt-1.5 text-xl font-bold text-slate-900">{formatPeso(summary.salaryTotal)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Other Expenses</p>
          <p className="mt-1.5 text-xl font-bold text-slate-900">{formatPeso(summary.otherTotal)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Grand Total</p>
          <p className="mt-1.5 text-xl font-bold text-red-700">{formatPeso(summary.grandTotal)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {["", "SALARY", "OTHER"].map((t) => (
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

      {loading ? <LoadingBlock label="Loading expenses" /> : null}

      {!loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {expenses.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-slate-400">No expenses recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {expenses.map((ex) => (
                <div key={ex.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50">
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${
                    ex.type === "SALARY" ? "text-blue-600 bg-blue-50 border-blue-200" : "text-slate-600 bg-slate-50 border-slate-200"
                  }`}>
                    <Receipt size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{ex.description || ex.type}</p>
                    <p className="text-xs text-slate-500">{ex.type} · {ex.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-rose-600">{formatPeso(ex.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      ) : null}

      {/* New Expense Modal */}
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">New Expense</h2>
                <p className="mt-0.5 text-sm text-slate-500">Record a business expense (salary or other).</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X size={18} /></button>
            </div>
            {expError ? <div className="flex-shrink-0 mx-6 mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{expError}</div> : null}
            <form id="new-expense-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 px-6 py-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                <div className="flex gap-2">
                  {(["SALARY", "OTHER"] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setExpType(t)}
                      className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${expType === t ? "border-red-500 bg-red-50 text-red-700" : "border-slate-300 bg-white text-slate-600"}`}
                    >{t === "SALARY" ? "Salary" : "Other Expense"}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Amount *</label>
                <input required type="number" step="0.01" min="0.01" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} placeholder="0.00" className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <input value={expDesc} onChange={(e) => setExpDesc(e.target.value)} placeholder="e.g. Office rent, employee salary" className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Date *</label>
                <input required type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </div>
              {expType === "OTHER" ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Custom Fields</p>
                  <div className="space-y-2">
                    {customFields.map((field, i) => (
                      <div key={i} className="flex gap-2">
                        <input placeholder="Field name" value={field.key} onChange={(e) => { const u = [...customFields]; u[i] = { ...u[i], key: e.target.value }; setCustomFields(u); }} className="h-10 flex-1 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
                        <input placeholder="Value" value={field.value} onChange={(e) => { const u = [...customFields]; u[i] = { ...u[i], value: e.target.value }; setCustomFields(u); }} className="h-10 flex-[2] rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
                        <button type="button" onClick={() => setCustomFields(customFields.filter((_, j) => j !== i))} className="size-10 rounded-xl border border-slate-300 text-slate-500 hover:bg-slate-50">×</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setCustomFields([...customFields, { key: "", value: "" }])} className="inline-flex h-9 items-center gap-1 rounded-lg border border-dashed border-slate-300 bg-white px-3 text-xs font-medium text-slate-500 hover:border-slate-400 transition-all">+ Add Field</button>
                  </div>
                </div>
              ) : null}
            </form>
            <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button type="button" onClick={() => setModalOpen(false)} className="min-h-[44px] sm:min-h-0 w-full sm:w-auto inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 px-6 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98]">Cancel</button>
              <button type="submit" form="new-expense-form" disabled={expLoading} className="min-h-[44px] sm:min-h-0 w-full sm:w-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-800 px-6 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:scale-[0.98] disabled:bg-slate-300"><Plus size={16} /> {expLoading ? "Saving..." : "Record Expense"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
