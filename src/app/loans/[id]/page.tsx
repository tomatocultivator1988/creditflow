"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Ban, Camera, CheckCircle2, ChevronDown, ChevronUp, Clock, FileText, Pencil, Trash2, Upload, X, XCircle } from "lucide-react";
import { ConfirmModal } from "@/components/confirm-modal";
import { ErrorMessage, LoadingBlock } from "@/components/ui-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { apiRequest } from "@/lib/client-api";
import { formatPeso } from "@/lib/money";
import type { LoanAccountDto, LoanScheduleDto, PaymentDto } from "@/types/api";

export default function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const [loan, setLoan] = useState<LoanAccountDto | null>(null);
  const [schedule, setSchedule] = useState<LoanScheduleDto[]>([]);
  const [payments, setPayment] = useState<PaymentDto[]>([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  // Void payment
  const [voidModal, setVoidModal] = useState(false);
  const [voidPaymentId, setVoidPaymentId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [voidConfirm, setVoidConfirm] = useState("");
  const [voiding, setVoiding] = useState(false);

  // Edit form
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editFbLink, setEditFbLink] = useState("");
  const [editIdNumber, setEditIdNumber] = useState("");
  const [editIdType, setEditIdType] = useState("");
  const [editRemarks, setEditRemarks] = useState("");

  // Payment form
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));

  const [payNotes, setPayNotes] = useState("");

  const isAdmin = session?.user?.role === "ADMIN";

  const fetchData = useCallback(() => {
    Promise.all([
      apiRequest<{ loanAccount: LoanAccountDto }>(`/api/loans/${id}`),
      apiRequest<{ schedule: LoanScheduleDto[] }>(`/api/loans/${id}/schedule`),
      apiRequest<{ payments: PaymentDto[] }>(`/api/loans/${id}/payments`),
    ])
      .then(([loanData, scheduleData, paymentsData]) => {
        setLoan(loanData.loanAccount);
        setSchedule(scheduleData.schedule);
        setPayment(paymentsData.payments);
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Edit
  function openEdit() {
    if (!loan) return;
    setEditName(loan.customerName);
    setEditPhone(loan.customerPhone);
    setEditEmail(loan.customerEmail || "");
    setEditAddress(loan.customerAddress);
    setEditFbLink(loan.fbLink || "");
    setEditIdNumber(loan.idNumber || "");
    setEditIdType(loan.validIdType || "");
    setEditRemarks(loan.remarks || "");
    setEditOpen(true);
  }

  async function handleEditSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEditLoading(true);
    try {
      const result = await apiRequest<{ loanAccount: LoanAccountDto }>(`/api/loans/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          customerName: editName,
          customerPhone: editPhone,
          customerEmail: editEmail || undefined,
          customerAddress: editAddress,
          fbLink: editFbLink || undefined,
          idNumber: editIdNumber || undefined,
          validIdType: editIdType || undefined,
          remarks: editRemarks || undefined,
        }),
      });
      setLoan(result.loanAccount);
      setEditOpen(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEditLoading(false);
    }
  }

  // Payment
  function openPayment() {
    setPayAmount(loan ? loan.dailyInstallment : "");
    setPayDate(new Date().toISOString().slice(0, 10));

    setPayNotes("");
    setPaymentOpen(true);
  }

  async function handlePaymentSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPaymentLoading(true);
    try {
      await apiRequest("/api/payments", {
        method: "POST",
        body: JSON.stringify({
          loanAccountId: id,
          amount: payAmount,
          paymentDate: payDate,
          notes: payNotes || undefined,
        }),
      });
      setPaymentOpen(false);
      fetchData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPaymentLoading(false);
    }
  }

  // Photo
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await apiRequest<{ profilePicUrl: string }>(
        `/api/loans/${id}/upload-photo`, { method: "POST", body: formData },
      );
      if (loan) setLoan({ ...loan, profilePicUrl: result.profilePicUrl });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  // Release
  async function handleRelease() {
    setActionLoading(true);
    try {
      const result = await apiRequest<{ loanAccount: LoanAccountDto }>(`/api/loans/${id}/release`, { method: "POST" });
      setLoan(result.loanAccount);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  }

  // Close
  async function handleClose() {
    setActionLoading(true);
    try {
      await apiRequest(`/api/loans/${id}/close`, { method: "POST" });
      fetchData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  }

  // Delete
  async function handleDelete() {
    setActionLoading(true);
    try {
      await apiRequest(`/api/loans/${id}`, { method: "DELETE" });
      router.push("/loans");
    } catch (err) {
      setError((err as Error).message);
      setActionLoading(false);
      setConfirmDelete(false);
    }
  }

  // Void payment handler
  async function handleVoidPayment() {
    if (!voidPaymentId || voidConfirm !== "VOID") return;
    setVoiding(true);
    try {
      await apiRequest(`/api/payments/${voidPaymentId}/void`, {
        method: "POST",
        body: JSON.stringify({ reason: voidReason }),
      });
      setVoidModal(false);
      setVoidPaymentId(null);
      setVoidConfirm("");
      fetchData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setVoiding(false);
    }
  }

  const latestNonVoidedPaymentId = payments
    .filter((p) => !p.voided)
    .sort((a, b) => {
      const dc = new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
      if (dc !== 0) return dc;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })[0]?.id;

  if (error) return <ErrorMessage message={error} />;
  if (!loan) return <LoadingBlock />;

  const paidCount = schedule.filter((s) => s.status === "PAID").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Loan Detail" description={loan.customerName} />
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/loans/${id}/statement`}
            className="inline-flex min-h-[44px] sm:min-h-0 h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98]"
          >
            <FileText size={14} /> Statement
          </Link>
          {isAdmin ? (
            <>
              <button
                onClick={openEdit}
                className="inline-flex min-h-[44px] sm:min-h-0 h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98]"
              >
                <Pencil size={14} /> Edit
              </button>
              {loan.status !== "FULLY_PAID" ? (
                <button
                  onClick={handleClose}
                  disabled={actionLoading}
                  className="inline-flex min-h-[44px] sm:min-h-0 h-10 items-center gap-2 rounded-xl border border-emerald-600 px-4 text-sm font-medium text-emerald-700 shadow-sm hover:bg-emerald-50 active:scale-[0.98] disabled:opacity-50"
                >
                  <XCircle size={14} /> Close
                </button>
              ) : null}
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={actionLoading}
                className="inline-flex min-h-[44px] sm:min-h-0 h-10 items-center gap-2 rounded-xl border border-rose-300 px-4 text-sm font-medium text-rose-700 shadow-sm hover:bg-rose-50 active:scale-[0.98] disabled:opacity-50"
              >
                <Trash2 size={14} /> Delete
              </button>
            </>
          ) : null}
          <button
            onClick={openPayment}
            className="inline-flex min-h-[44px] sm:min-h-0 h-10 items-center gap-2 rounded-xl bg-red-800 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:scale-[0.98]"
          >
            Post Payment
          </button>
        </div>
      </div>

      {/* Top row: Customer Info + Loan Terms */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Customer Information</h3>
            <div className="flex items-start gap-4">
            <div className="shrink-0">
              {loan.profilePicUrl ? (
                <button onClick={() => setPreviewImg(loan.profilePicUrl)}>
                  <img src={loan.profilePicUrl} alt="" className="size-20 rounded-xl object-cover cursor-pointer hover:ring-2 hover:ring-red-300 transition-all" />
                </button>
              ) : (
                <div className="flex size-20 items-center justify-center rounded-xl bg-slate-100">
                  <Camera size={24} className="text-slate-300" />
                </div>
              )}
          {!loan.released ? (
            <button
              onClick={handleRelease}
              disabled={actionLoading}
              className="inline-flex min-h-[44px] sm:min-h-0 h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-50"
            >
              <CheckCircle2 size={14} /> Mark Released
            </button>
          ) : null}
          {isAdmin ? (
                <label className="mt-2 flex cursor-pointer items-center justify-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200">
                  <Upload size={12} />
                  {uploading ? "..." : "Photo"}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                </label>
              ) : null}
            </div>
            <div className="min-w-0 flex-1 space-y-1.5 text-sm">
              <p className="font-medium text-slate-900">{loan.customerName}</p>
              <p className="text-slate-500">{loan.customerPhone}</p>
              {loan.customerEmail ? <p className="text-slate-500">{loan.customerEmail}</p> : null}
              <p className="text-slate-500">{loan.customerAddress}</p>
              {loan.fbLink ? (
                <p className="text-slate-500">
                  <a href={loan.fbLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook Profile</a>
                </p>
              ) : null}
              {loan.idNumber ? <p className="text-slate-500">ID: {loan.idNumber} {loan.validIdType ? `(${loan.validIdType})` : ""}</p> : null}
              <p className="text-slate-500">
                Status: <StatusBadge status={loan.status} nextDueDate={loan.nextDueDate} /> | Next Due: {loan.nextDueDate}
              </p>
              <p className="text-slate-500">
                Release: {loan.released
                  ? <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200"><CheckCircle2 size={11} /> Released</span>
                  : <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200"><Clock size={11} /> Unreleased</span>
                }
                {loan.releasedAt ? <span className="text-xs text-slate-400 ml-1">· {new Date(loan.releasedAt).toLocaleDateString()}</span> : null}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Pricing</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Principal</span>
              <span className="font-medium text-slate-900">{formatPeso(loan.principal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Interest ({loan.interestRate}%)</span>
              <span className="font-medium text-slate-900">{formatPeso(loan.interestAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Processing Fee</span>
              <span className="font-medium text-slate-900">{formatPeso(loan.processingFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Payable</span>
              <span className="font-medium text-slate-900">{formatPeso(loan.totalPayable)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Daily Installment</span>
              <span className="font-medium text-slate-900">{formatPeso(loan.dailyInstallment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Remaining</span>
              <span className="font-bold text-red-700">{formatPeso(loan.remainingBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Term</span>
              <span className="font-medium text-slate-900">{loan.termDays} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Timeline</span>
              <span className="font-medium text-slate-900">{loan.startDate} – {loan.endDate}</span>
            </div>
          </div>
          {loan.remarks ? (
            <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">{loan.remarks}</p>
          ) : null}
        </div>
      </div>

      {/* Schedule */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button
          onClick={() => setScheduleOpen(!scheduleOpen)}
          className="flex w-full items-center justify-between px-6 py-4 text-sm font-semibold text-slate-900"
        >
          Installment Schedule ({schedule.length} periods)
          {scheduleOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </button>
        {scheduleOpen ? (
          <div className="px-6 pb-4">
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Progress</span>
                <span className="font-medium text-emerald-600">{paidCount} / {schedule.length} paid</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${schedule.length > 0 ? (paidCount / schedule.length) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="pb-2 pr-2 font-medium">#</th>
                    <th className="pb-2 pr-2 font-medium">Due Date</th>
                    <th className="pb-2 pr-2 font-medium text-right">Amount</th>
                    <th className="pb-2 pr-2 font-medium text-right">Paid</th>
                    <th className="pb-2 pr-2 font-medium text-right">Balance</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedule.map((s) => {
                    const sAmount = parseFloat(s.amount);
                    const sPaid = s.paidAmount ? parseFloat(s.paidAmount) : 0;
                    const sBalance = sAmount - sPaid;
                    const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
                    const dueDate = s.dueDate;
                    const diffMs = new Date(todayStr).getTime() - new Date(dueDate).getTime();
                    const overdueDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-2 pr-2 text-slate-400">{s.periodNumber}</td>
                        <td className="py-2 pr-2 text-slate-700">{s.dueDate}</td>
                        <td className="py-2 pr-2 text-right font-medium">{formatPeso(s.amount)}</td>
                        <td className="py-2 pr-2 text-right text-slate-500">
                          {s.paidAmount ? formatPeso(s.paidAmount) : "—"}
                        </td>
                        <td className={`py-2 pr-2 text-right font-medium ${sBalance > 0 ? "text-rose-600" : sBalance < 0 ? "text-emerald-600" : "text-slate-400"}`}>
                          {sBalance === 0 ? "—" : formatPeso(String(Math.abs(sBalance)))}
                        </td>
                        <td className="py-2">
                          <div className="flex flex-col items-start gap-0.5">
                            <StatusBadge status={s.status} />
                            {s.status === "OVERDUE" && overdueDays > 0 ? (
                              <span className="text-[10px] text-rose-500 leading-none">Overdue {overdueDays}d</span>
                            ) : null}
                            {s.status === "PARTIAL" && sBalance > 0 ? (
                              <span className="text-[10px] text-amber-500 leading-none">Remaining {formatPeso(String(sBalance))}</span>
                            ) : null}
                            {s.paidAmount && sBalance < 0 ? (
                              <span className="text-[10px] text-emerald-500 leading-none">Excess {formatPeso(String(Math.abs(sBalance)))}</span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>

      {/* Payment History */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className="flex w-full items-center justify-between px-6 py-4 text-sm font-semibold text-slate-900"
        >
          Payment History
          {historyOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </button>
        {historyOpen ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Amount</th>
                         <th className="hidden sm:table-cell px-4 py-3 font-medium text-slate-600">Notes</th>
                          <th className="px-4 py-3 font-medium text-slate-600 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                     <td colSpan={4} className="px-4 py-8 text-center text-slate-400">No payments yet</td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">{p.paymentDate}</td>
                      <td className="px-4 py-3 font-medium text-emerald-600">{formatPeso(p.amount)}</td>
                       <td className="hidden sm:table-cell px-4 py-3 text-slate-500">{p.notes || "—"}</td>
                         <td className="px-4 py-3">
                           {p.voided ? (
                             <span className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">VOIDED</span>
                           ) : !loan || loan.status === "FULLY_PAID" ? null : p.id === latestNonVoidedPaymentId ? (
                             <button
                               type="button"
                               onClick={() => { setVoidPaymentId(p.id); setVoidReason(""); setVoidConfirm(""); setVoidModal(true); }}
                               className="inline-flex h-7 items-center gap-1 rounded-lg border border-rose-200 bg-white px-2 text-[10px] font-medium text-rose-600 hover:bg-rose-50 active:scale-[0.98]"
                             >
                               <Ban size={12} /> Void
                             </button>
                           ) : null}
                         </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {/* Edit Modal */}
      {editOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setEditOpen(false)}>
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Edit Loan</h2>
                <p className="mt-0.5 text-sm text-slate-500">{loan.customerName}</p>
              </div>
              <button onClick={() => setEditOpen(false)} className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form id="edit-loan-form" onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto space-y-4 px-6 py-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name *</label>
                <input required value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Phone *</label>
                <input required value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Address *</label>
                <input required value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Facebook Profile Link</label>
                <input type="url" value={editFbLink} onChange={(e) => setEditFbLink(e.target.value)} placeholder="https://facebook.com/username" className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">ID Number</label>
                  <input value={editIdNumber} onChange={(e) => setEditIdNumber(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Valid ID Type</label>
                  <select value={editIdType} onChange={(e) => setEditIdType(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100">
                    <option value="">Select...</option>
                    <option value="National ID">National ID</option>
                    <option value="Driver&apos;s License">Driver&apos;s License</option>
                    <option value="Passport">Passport</option>
                    <option value="UMID">UMID</option>
                    <option value="SSS ID">SSS ID</option>
                    <option value="Postal ID">Postal ID</option>
                    <option value="Voter&apos;s ID">Voter&apos;s ID</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Remarks</label>
                <input value={editRemarks} onChange={(e) => setEditRemarks(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </div>
            </form>
            <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button type="button" onClick={() => setEditOpen(false)} className="min-h-[44px] sm:min-h-0 w-full sm:w-auto inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 px-6 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98]">Cancel</button>
              <button type="submit" form="edit-loan-form" disabled={editLoading} className="min-h-[44px] sm:min-h-0 w-full sm:w-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-800 px-6 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:scale-[0.98] disabled:bg-slate-300">{editLoading ? "Saving..." : "Save Changes"}</button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Payment Modal */}
      {paymentOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setPaymentOpen(false)}>
          <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Post Payment</h2>
                <p className="mt-0.5 text-sm text-slate-500">{loan?.customerName}</p>
              </div>
              <button onClick={() => setPaymentOpen(false)} className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="flex-shrink-0 mx-6 mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm">
              <p className="font-medium text-slate-900">{loan?.customerName}</p>
              <p className="text-xs text-slate-500">{loan?.customerPhone} | Balance: {loan ? formatPeso(loan.remainingBalance) : ""} | Daily: {loan ? formatPeso(loan.dailyInstallment) : ""}</p>
            </div>
            <form id="payment-form" onSubmit={handlePaymentSubmit} className="flex-1 overflow-y-auto space-y-4 px-6 py-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Amount *</label>
                <input required type="number" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
                {loan && payAmount && parseFloat(payAmount) > parseFloat(loan.remainingBalance) ? (
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-xs text-amber-600">Amount exceeds remaining balance of {formatPeso(loan.remainingBalance)}</span>
                    <button type="button" onClick={() => setPayAmount(loan.remainingBalance)} className="text-xs font-medium text-red-700 hover:underline">Set exact</button>
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
              <button type="button" onClick={() => setPaymentOpen(false)} className="min-h-[44px] sm:min-h-0 w-full sm:w-auto inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 px-6 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98]">Cancel</button>
              <button type="submit" form="payment-form" disabled={paymentLoading} className="min-h-[44px] sm:min-h-0 w-full sm:w-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-800 px-6 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:scale-[0.98] disabled:bg-slate-300">{paymentLoading ? "Posting..." : "Post Payment"}</button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        open={confirmDelete}
        title="Delete Loan"
        message={`Are you sure you want to permanently delete the loan for ${loan.customerName}? This will also delete all payments, schedule records, and activity logs. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => { setConfirmDelete(false); setActionLoading(false); }}
      />

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

      {/* Void Payment Modal */}
      {voidModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setVoidModal(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">Void Payment</h2>
              <button onClick={() => setVoidModal(false)} className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="space-y-4 px-6 py-4">
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                <p className="text-sm text-rose-800">This will reverse the payment and restore the schedule. This cannot be undone.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Type VOID to confirm</label>
                <input
                  value={voidConfirm}
                  onChange={(e) => setVoidConfirm(e.target.value)}
                  placeholder="VOID"
                  className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason</label>
                <textarea
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Why is this being voided?"
                  className="min-h-[60px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button type="button" onClick={() => setVoidModal(false)} className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button
                  type="button"
                  onClick={handleVoidPayment}
                  disabled={voiding || voidConfirm !== "VOID"}
                  className="h-10 rounded-xl bg-rose-700 px-5 text-sm font-medium text-white hover:bg-rose-800 disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {voiding ? "Voiding..." : "Void Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
