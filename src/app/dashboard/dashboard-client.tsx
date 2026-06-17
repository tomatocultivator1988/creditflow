"use client";

import { useEffect, useState } from "react";
import {
  Landmark,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  PiggyBank,
  DollarSign,
} from "lucide-react";
import { ErrorMessage, LoadingBlock } from "@/components/ui-state";
import { apiRequest } from "@/lib/client-api";
import { formatPeso } from "@/lib/money";
import type { DashboardMetricsDto } from "@/types/api";

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color,
  bgGradient,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number }>;
  trend?: string;
  color: string;
  bgGradient: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg ${bgGradient}`}
    >
      <div className="absolute -right-2 -top-2 size-20 rounded-full bg-white/10" />
      <div className="absolute -right-4 -bottom-4 size-24 rounded-full bg-white/5" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/80">{label}</span>
          <div
            className={`flex size-10 items-center justify-center rounded-xl ${color}`}
          >
            <Icon size={20} />
          </div>
        </div>
        <div className="mt-4 text-4xl font-bold tracking-tight">{value}</div>
        {trend ? (
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-white/70">
            <ArrowUpRight size={12} /> {trend}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CompactCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className={`rounded-xl border-l-4 bg-white p-4 shadow-sm ${color}`}
    >
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

const statuses = [
  {
    key: "activeLoans" as const,
    label: "Active",
    color: "bg-emerald-500",
    ring: "ring-emerald-100",
    icon: CheckCircle2,
  },
  {
    key: "overdueLoans" as const,
    label: "Overdue",
    color: "bg-rose-500",
    ring: "ring-rose-100",
    icon: AlertTriangle,
  },
  {
    key: "fullyPaidLoans" as const,
    label: "Fully Paid",
    color: "bg-slate-500",
    ring: "ring-slate-100",
    icon: CheckCircle2,
  },
];

export function DashboardClient() {
  const [metrics, setMetrics] = useState<DashboardMetricsDto | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<{ metrics: DashboardMetricsDto }>("/api/dashboard")
      .then((data) => setMetrics(data.metrics))
      .catch((requestError: Error) => setError(requestError.message));
  }, []);

  const now = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());

  if (error) return <ErrorMessage message={error} />;
  if (!metrics) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500">{now}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Loans"
          value={metrics.totalLoans}
          icon={Landmark}
          bgGradient="bg-gradient-to-br from-blue-600 to-blue-800"
          color="bg-white/20"
        />
        <StatCard
          label="Collections Today"
          value={formatPeso(metrics.collectionsToday)}
          icon={DollarSign}
          bgGradient="bg-gradient-to-br from-emerald-600 to-emerald-800"
          color="bg-white/20"
        />
        <StatCard
          label="This Month"
          value={formatPeso(metrics.collectionsThisMonth)}
          icon={TrendingUp}
          bgGradient="bg-gradient-to-br from-violet-600 to-violet-800"
          color="bg-white/20"
          trend="Collections"
        />
        <StatCard
          label="Outstanding Balance"
          value={formatPeso(metrics.outstandingBalances)}
          icon={PiggyBank}
          bgGradient="bg-gradient-to-br from-orange-500 to-orange-700"
          color="bg-white/20"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CompactCard
          label="Total Principal"
          value={formatPeso(metrics.totalPrincipal)}
          color="border-l-blue-500"
        />
        <CompactCard
          label="Interest Earned"
          value={formatPeso(metrics.totalInterest)}
          color="border-l-emerald-500"
        />
        <CompactCard
          label="Total Collections"
          value={formatPeso(metrics.totalCollections)}
          color="border-l-violet-500"
        />
        <CompactCard
          label="This Week"
          value={formatPeso(metrics.collectionsThisWeek)}
          color="border-l-amber-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {statuses.map(({ key, label, color, ring, icon: Icon }) => (
          <div
            key={key}
            className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ${ring}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex size-10 items-center justify-center rounded-xl ${color} text-white`}
              >
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-900">
                  {metrics[key]}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold font-heading text-slate-900">
          Overdue Aging
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: "Current",
              value: metrics.aging.current,
              color: "text-emerald-600",
            },
            {
              label: "1-30 Days",
              value: metrics.aging.days1to30,
              color: "text-amber-600",
            },
            {
              label: "31-60 Days",
              value: metrics.aging.days31to60,
              color: "text-orange-600",
            },
            {
              label: "61-90 Days",
              value: metrics.aging.days61to90,
              color: "text-red-600",
            },
            {
              label: "90+ Days",
              value: metrics.aging.days90plus,
              color: "text-red-800",
            },
          ].map((a) => (
            <div key={a.label} className="text-center">
              <p className={`text-2xl font-bold ${a.color}`}>{a.value}</p>
              <p className="text-xs text-slate-500">{a.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
