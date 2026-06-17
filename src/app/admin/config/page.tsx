"use client";

import { FormEvent, useEffect, useState } from "react";
import { ErrorMessage } from "@/components/ui-state";
import { PageHeader } from "@/components/page-header";
import { apiRequest } from "@/lib/client-api";
import type { AdminConfigDto } from "@/types/api";

export default function AdminConfigPage() {
  const [, setConfig] = useState<AdminConfigDto | null>(null);
  const [defaultInterestRate, setDefaultInterestRate] = useState("5.00");
  const [termOptions, setTermOptions] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<{ config: AdminConfigDto }>("/api/admin/config")
      .then((data) => {
        setConfig(data.config);
        setDefaultInterestRate(data.config.defaultInterestRate);
        setTermOptions(data.config.termOptions.join(", "));
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setLoading(true);

    try {
      const parsed = termOptions
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n) && n > 0);

      const data = await apiRequest<{ config: AdminConfigDto }>(
        "/api/admin/config",
        {
          method: "PUT",
          body: JSON.stringify({
            defaultInterestRate,
            termOptions: parsed,
          }),
        },
      );
      setConfig(data.config);
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader
        title="Settings"
        description="Configure system defaults"
      />

      {error ? <ErrorMessage message={error} /> : null}
      {saved ? (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-700">
          Settings saved successfully
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Default Interest Rate (%)
            <input
              required
              type="number"
              step="0.01"
              value={defaultInterestRate}
              onChange={(e) => setDefaultInterestRate(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </label>
          <p className="mt-1 text-xs text-slate-400">
            Default interest rate applied to new loans
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Term Options (days)
            <input
              required
              value={termOptions}
              onChange={(e) => setTermOptions(e.target.value)}
              placeholder="30, 60, 90, 120, 150, 180"
              className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </label>
          <p className="mt-1 text-xs text-slate-400">
            Comma-separated list of term options in days
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="min-h-[44px] sm:min-h-0 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-800 px-6 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-red-700 hover:shadow-md active:scale-[0.98] disabled:bg-slate-300"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
