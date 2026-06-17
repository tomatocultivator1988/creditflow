"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ErrorMessage } from "@/components/ui-state";
import { PageHeader } from "@/components/page-header";
import { apiRequest } from "@/lib/client-api";
import { formatPeso } from "@/lib/money";
import type { AdminConfigDto } from "@/types/api";

export default function NewLoanPage() {
  const router = useRouter();
  const [config, setConfig] = useState<AdminConfigDto | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [validIdType, setValidIdType] = useState("");
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [processingFee, setProcessingFee] = useState("");
  const [termDays, setTermDays] = useState(30);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    apiRequest<{ config: AdminConfigDto }>("/api/admin/config")
      .then((data) => {
        setConfig(data.config);
        setInterestRate(data.config.defaultInterestRate);
      })
      .catch(() => {});
  }, []);

  const principalNum = parseFloat(principal) || 0;
  const rateNum = parseFloat(interestRate) || 0;
  const feeNum = parseFloat(processingFee) || 0;
  const interestAmount =
    principalNum && rateNum
      ? principalNum * (rateNum / 100)
      : 0;
  const totalPayable = principalNum + interestAmount;
  const rawDaily = termDays > 0 ? totalPayable / termDays : 0;
  const dailyInstallment = Math.round(rawDaily / 10) * 10;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiRequest("/api/loans", {
        method: "POST",
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerAddress,
          idNumber: idNumber || undefined,
          validIdType: validIdType || undefined,
          principal,
          interestRate,
          processingFee: processingFee || undefined,
          termDays,
          startDate,
          remarks: remarks || undefined,
        }),
      });
      router.push("/loans");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="New Loan" description="Create a new cash loan account" />

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
            Loan Details
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Principal *
                <input
                  required
                  type="number"
                  step="0.01"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  placeholder="0.00"
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Interest Rate %
                <input
                  required
                  type="number"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Processing Fee
                <input
                  type="number"
                  step="0.01"
                  value={processingFee}
                  onChange={(e) => setProcessingFee(e.target.value)}
                  placeholder="0.00"
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Term (Days) *
                <input
                  required
                  type="number"
                  min="1"
                  max="365"
                  value={termDays}
                  onChange={(e) => setTermDays(Number(e.target.value))}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Start Date *
                <input
                  required
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </label>
            </div>
            <div className="sm:col-span-2">
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

        <div className="rounded-xl bg-slate-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Computation Preview
          </h3>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Interest Amount:</span>
              <span className="font-medium">
                {formatPeso(interestAmount.toFixed(2))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Processing Fee:</span>
              <span className="font-medium">
                {formatPeso(feeNum.toFixed(2))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Payable:</span>
              <span className="font-medium">
                {formatPeso(totalPayable.toFixed(2))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Daily Installment:</span>
              <span className="font-medium">
                {formatPeso(dailyInstallment.toFixed(2))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Term:</span>
              <span className="font-medium">{termDays} days</span>
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
            {loading ? "Creating..." : "Create Loan"}
          </button>
        </div>
      </form>
    </div>
  );
}
