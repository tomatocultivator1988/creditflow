"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ErrorMessage, LoadingBlock } from "@/components/ui-state";
import { PageHeader } from "@/components/page-header";
import { apiRequest } from "@/lib/client-api";
import type { LoanAccountDto } from "@/types/api";

export default function EditLoanPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [validIdType, setValidIdType] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ loanAccount: LoanAccountDto }>(`/api/loans/${id}`)
      .then((data) => {
        const l = data.loanAccount;
        setCustomerName(l.customerName);
        setCustomerPhone(l.customerPhone);
        setCustomerAddress(l.customerAddress);
        setIdNumber(l.idNumber || "");
        setValidIdType(l.validIdType || "");
        setRemarks(l.remarks || "");
      })
      .catch(() => router.push("/loans"))
      .finally(() => setPageLoading(false));
  }, [id, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiRequest(`/api/loans/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerAddress,
          idNumber: idNumber || undefined,
          validIdType: validIdType || undefined,
          remarks: remarks || undefined,
        }),
      });
      router.push(`/loans/${id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) return <LoadingBlock />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Edit Loan" description={customerName} />

      {error ? <ErrorMessage message={error} /> : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            Customer Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Full Name *
                <input
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Phone *
                <input
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                ID Number
                <input
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Address *
                <input
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Valid ID Type
                <select
                  value={validIdType}
                  onChange={(e) => setValidIdType(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                >
                  <option value="">Select...</option>
                  <option value="National ID">National ID</option>
                  <option value="Driver&apos;s License">Driver&apos;s License</option>
                  <option value="Passport">Passport</option>
                  <option value="UMID">UMID</option>
                  <option value="SSS ID">SSS ID</option>
                  <option value="Postal ID">Postal ID</option>
                  <option value="Voter&apos;s ID">Voter&apos;s ID</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            Other
          </h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Remarks
                <input
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-10 rounded-xl border border-slate-300 px-6 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-800 px-6 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-red-700 hover:shadow-md active:scale-[0.98] disabled:bg-slate-300"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
