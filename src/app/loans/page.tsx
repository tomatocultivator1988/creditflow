"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Camera, CheckCircle2, Eye, Plus, Printer, Search, X } from "lucide-react";
import { ErrorMessage, LoadingBlock } from "@/components/ui-state";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { ResponsiveTable } from "@/components/responsive-table";
import { apiRequest } from "@/lib/client-api";
import { formatPeso } from "@/lib/money";
import type { AdminConfigDto, LoanAccountDto } from "@/types/api";

export default function LoansPage() {
  const { data: session } = useSession();
  const [loans, setLoans] = useState<LoanAccountDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = session?.user?.role === "ADMIN";
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  // New loan modal
  const [newOpen, setNewOpen] = useState(false);
  const [config, setConfig] = useState<AdminConfigDto | null>(null);
  const [nlError, setNlError] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [fbLink, setFbLink] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [validIdType, setValidIdType] = useState("");
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [processingFee, setProcessingFee] = useState("");
  const [termDays, setTermDays] = useState(30);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (dueDate) params.set("dueBefore", dueDate);

    apiRequest<{ loanAccounts: LoanAccountDto[]; pagination: { page: number; totalPages: number } }>(`/api/loans?${params}`)
      .then((data) => { setLoans(data.loanAccounts); setTotalPages(data.pagination.totalPages); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, search, status, dueDate]);

  useEffect(() => {
    if (isAdmin && typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("new") === "1") openNew();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSearch((formData.get("search") as string) || "");
    setPage(1);
  }

  function openNew() {
    setNewOpen(true);
    setNlError("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setCustomerAddress("");
    setFbLink("");
    setIdNumber("");
    setValidIdType("");
    setPrincipal("");
    setInterestRate("");
    setProcessingFee("");
    setTermDays(30);
    setStartDate(new Date().toISOString().slice(0, 10));
    setRemarks("");
    apiRequest<{ config: AdminConfigDto }>("/api/admin/config")
      .then((data) => { setConfig(data.config); setInterestRate(data.config.defaultInterestRate); })
      .catch(() => {});
  }

  async function handleNewLoan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNlError("");
    setNlLoading(true);
    try {
      await apiRequest("/api/loans", {
        method: "POST",
        body: JSON.stringify({
          customerName, customerPhone, customerEmail: customerEmail || undefined,
          customerAddress, fbLink: fbLink || undefined,
          idNumber: idNumber || undefined, validIdType: validIdType || undefined,
          principal, interestRate, processingFee: processingFee || undefined,
          termDays, startDate, remarks: remarks || undefined,
        }),
      });
      setNewOpen(false);
      setPage(1);
      setSearch("");
      setStatus("");
      // Reload
      apiRequest<{ loanAccounts: LoanAccountDto[]; pagination: { page: number; totalPages: number } }>("/api/loans?page=1&limit=20")
        .then((data) => { setLoans(data.loanAccounts); setTotalPages(data.pagination.totalPages); });
    } catch (err) {
      setNlError((err as Error).message);
    } finally {
      setNlLoading(false);
    }
  }

  const principalNum = parseFloat(principal) || 0;
  const rateNum = parseFloat(interestRate) || 0;
  const feeNum = parseFloat(processingFee) || 0;
  const interestAmt = principalNum && rateNum ? principalNum * (rateNum / 100) : 0;
  const totalPayable = principalNum + interestAmt;
  const rawDaily = termDays > 0 ? totalPayable / termDays : 0;
  const dailyInstallment = Math.floor(rawDaily * 100) / 100;

  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Loans" description="Manage loan accounts" />
        {isAdmin ? (
          <button onClick={openNew} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-800 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:scale-[0.98] transition-colors">
            <Plus size={16} /> New Loan
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input name="search" placeholder="Search customer..." defaultValue={search} className="h-10 w-full rounded-xl border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
          </div>
          <button type="submit" className="h-10 rounded-xl bg-slate-100 px-4 text-sm font-medium text-slate-700 hover:bg-slate-200 active:scale-[0.98]">Search</button>
        </form>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="OVERDUE">Overdue</option>
          <option value="FULLY_PAID">Fully Paid</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <span className="text-xs font-semibold text-slate-500">Due on or before:</span>
        <input type="date" value={dueDate} onChange={(e) => { setDueDate(e.target.value); setPage(1); }} className="h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
        {dueDate ? (
          <button onClick={() => { setDueDate(""); setPage(1); }} className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-600 hover:bg-slate-50">Clear Filter</button>
        ) : null}
        <button onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-800 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:scale-[0.98] print:hidden">
          <Printer size={16} /> Print Sheet
        </button>
      </div>

      {loading ? (
        <LoadingBlock />
      ) : (
        <>
          {dueDate ? (
            <div className="hidden print:block text-xs text-slate-600 mb-2">
              <span className="font-semibold">Collection Sheet — Due on or before {dueDate}</span>
              <span className="ml-2 text-slate-400">({loans.length} loans)</span>
            </div>
          ) : null}
          {dueDate ? (
            <div className="grid gap-4 sm:grid-cols-3 print:grid-cols-3 print:hidden">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Loans Due</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{loans.length}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Collectible</p>
                <p className="mt-1 text-xl font-bold text-red-700">{formatPeso(loans.reduce((sum, l) => sum + parseFloat(l.remainingBalance), 0).toFixed(2))}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overdue</p>
                <p className="mt-1 text-xl font-bold text-rose-600">{loans.filter((l) => l.status === "OVERDUE").length}</p>
              </div>
            </div>
          ) : null}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm print:border print:border-slate-300 print:shadow-none print:rounded-none">
            <ResponsiveTable<LoanAccountDto>
              columns={[
                {
                  key: "customer",
                  label: "Customer",
                  render: (loan) => (
                    <div className="flex items-center gap-3">
                      {loan.profilePicUrl ? (
                        <button onClick={() => setPreviewImg(loan.profilePicUrl)} className="shrink-0 print:hidden">
                          <img src={loan.profilePicUrl} alt="" className="size-9 rounded-full object-cover ring-1 ring-slate-200 cursor-pointer hover:ring-red-300 transition-all" />
                        </button>
                      ) : (
                        <span className="flex size-9 items-center justify-center rounded-full bg-slate-100 shrink-0 ring-1 ring-slate-200 print:hidden">
                          <Camera size={14} className="text-slate-300" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <Link href={`/loans/${loan.id}`} className="font-medium text-slate-900 hover:text-red-700 truncate block print:text-black print:no-underline">
                          {loan.customerName}
                        </Link>
                        <p className="text-[11px] text-slate-400 truncate">{loan.customerPhone}</p>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "address",
                  label: "Address",
                  render: (loan) => <span className="text-xs text-slate-600">{loan.customerAddress}</span>,
                },
                {
                  key: "balance",
                  label: "Balance",
                  render: (loan) => <span className="font-medium">{formatPeso(loan.remainingBalance)}</span>,
                },
                {
                  key: "daily",
                  label: "Daily",
                  hide: "sm",
                  render: (loan) => <span className="text-slate-600">{formatPeso(loan.dailyInstallment)}</span>,
                },
                {
                  key: "release",
                  label: "Release",
                  hide: "sm",
                  render: (loan) => loan.released
                    ? <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700"><CheckCircle2 size={10} /> Released</span>
                    : <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">Unreleased</span>,
                },
                {
                  key: "status",
                  label: "Status",
                  render: (loan) => <StatusBadge status={loan.status} nextDueDate={loan.nextDueDate} />,
                },
                {
                  key: "nextDue",
                  label: "Next Due",
                  hide: "sm",
                  render: (loan) => <span className="text-slate-600">{loan.nextDueDate}</span>,
                },
                {
                  key: "action",
                  label: "Action",
                  render: (loan) => (
                    <Link href={`/loans/${loan.id}`} className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-colors">
                      <Eye size={14} /> View
                    </Link>
                  ),
                },
              ]}
              data={loans}
              emptyMessage="No loans found"
              mobileAccordion={{ summaryColumns: ["customer", "status"] }}
            />
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* New Loan Modal */}
      {newOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setNewOpen(false)}>
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">New Loan</h2>
                <p className="mt-0.5 text-sm text-slate-500">Create a new loan account</p>
              </div>
              <button onClick={() => setNewOpen(false)} className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X size={18} /></button>
            </div>
            {nlError ? <div className="flex-shrink-0 mx-6 mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{nlError}</div> : null}
            <form id="new-loan-form" onSubmit={handleNewLoan} className="flex-1 overflow-y-auto space-y-4 px-6 py-4">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">Customer Information</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Full Name *<input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Phone *<input required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">ID Number<input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="e.g. JBV-0001" className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Address *<input required value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Email<input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="customer@email.com" className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">FB Link<input type="url" value={fbLink} onChange={(e) => setFbLink(e.target.value)} placeholder="https://facebook.com/username" className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Valid ID Type<select value={validIdType} onChange={(e) => setValidIdType(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"><option value="">Select...</option><option value="National ID">National ID</option><option value="Driver&apos;s License">Driver&apos;s License</option><option value="Passport">Passport</option><option value="UMID">UMID</option><option value="SSS ID">SSS ID</option><option value="Postal ID">Postal ID</option><option value="Voter&apos;s ID">Voter&apos;s ID</option></select></label>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">Loan Details</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Principal *<input required type="number" step="0.01" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="0.00" className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Interest %<input required type="number" step="0.01" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Fee<input type="number" step="0.01" value={processingFee} onChange={(e) => setProcessingFee(e.target.value)} placeholder="0.00" className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Term (Days) *<input required type="number" min="1" max="365" value={termDays} onChange={(e) => setTermDays(Number(e.target.value))} className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Start Date *<input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Remarks<input value={remarks} onChange={(e) => setRemarks(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Preview</h3>
                <div className="grid gap-1.5 text-xs sm:text-sm sm:grid-cols-2">
                  <div className="flex justify-between"><span className="text-slate-500">Interest:</span><span className="font-medium">{formatPeso(interestAmt.toFixed(2))}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Fee:</span><span className="font-medium">{formatPeso(feeNum.toFixed(2))}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Total:</span><span className="font-medium">{formatPeso(totalPayable.toFixed(2))}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Daily:</span><span className="font-medium">{formatPeso(dailyInstallment.toFixed(2))}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Term:</span><span className="font-medium">{termDays}d</span></div>
                </div>
              </div>
            </form>
            <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button type="button" onClick={() => setNewOpen(false)} className="min-h-[44px] sm:min-h-0 w-full sm:w-auto inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 px-6 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98]">Cancel</button>
              <button type="submit" form="new-loan-form" disabled={nlLoading} className="min-h-[44px] sm:min-h-0 w-full sm:w-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-800 px-6 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:scale-[0.98] disabled:bg-slate-300">{nlLoading ? "Creating..." : "Create Loan"}</button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Image preview */}
      {previewImg ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4" onClick={() => setPreviewImg(null)}>
          <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <img src={previewImg} alt="" className="w-full rounded-2xl shadow-2xl" />
            <button onClick={() => setPreviewImg(null)} className="absolute -top-3 -right-3 flex size-8 items-center justify-center rounded-full bg-white shadow-lg text-slate-600 hover:text-slate-900">
              <X size={18} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
