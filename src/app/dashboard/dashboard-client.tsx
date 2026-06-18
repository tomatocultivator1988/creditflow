"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { LucideIcon } from "lucide-react";
import {
  Landmark,
  AlertTriangle,
  CheckCircle2,
  PiggyBank,
  ArrowUpRight,
  DollarSign,
  Users,
  FileText,
  BarChart3,
  Banknote,
  Receipt,
} from "lucide-react";
import { ErrorMessage, LoadingBlock } from "@/components/ui-state";
import { apiRequest } from "@/lib/client-api";
import { formatPeso } from "@/lib/money";
import type { DashboardMetricsDto } from "@/types/api";

function StatCard({ label, value, icon: Icon, trend, color, bgGradient }: {
  label: string; value: string | number; icon: LucideIcon; trend?: string; color: string; bgGradient: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg ${bgGradient}`}>
      <div className="absolute -right-2 -top-2 size-20 rounded-full bg-white/10" />
      <div className="absolute -right-4 -bottom-4 size-24 rounded-full bg-white/5" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/80">{label}</span>
          <div className={`flex size-10 items-center justify-center rounded-xl ${color}`}>
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

function CompactCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`rounded-xl border-l-4 bg-white p-4 shadow-sm ${color}`}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

const statusList = [
  { key: "activeLoans" as const, label: "Active", color: "bg-emerald-500", ring: "ring-emerald-100", icon: CheckCircle2 },
  { key: "overdueLoans" as const, label: "Overdue", color: "bg-rose-500", ring: "ring-rose-100", icon: AlertTriangle },
  { key: "fullyPaidLoans" as const, label: "Paid", color: "bg-slate-500", ring: "ring-slate-100", icon: CheckCircle2 },
];

export function DashboardClient() {
  const [metrics, setMetrics] = useState<DashboardMetricsDto | null>(null);
  const [error, setError] = useState("");
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    apiRequest<{ metrics: DashboardMetricsDto }>("/api/dashboard")
      .then((data) => setMetrics(data.metrics))
      .catch((requestError: Error) => setError(requestError.message));
  }, []);

  const now = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila", year: "numeric", month: "long", day: "numeric", weekday: "long",
  }).format(new Date());

  if (error) return <ErrorMessage message={error} />;
  if (!metrics) return <LoadingBlock label="Loading dashboard" />;

  const totalLoansDisplay = metrics.totalLoans;
  const overduePct = totalLoansDisplay > 0 ? Math.round((metrics.overdueLoans / totalLoansDisplay) * 100) : 0;
  const collectionRate = Number(metrics.totalCollections) > 0 && Number(metrics.totalPrincipal) > 0
    ? Math.round((Number(metrics.totalCollections) / Number(metrics.totalPrincipal)) * 100) : 0;

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">{now}</p>
        </div>
        {isAdmin ? (
        <Link href="/loans?new=1" className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-800 px-5 text-sm font-semibold text-white shadow-lg shadow-red-200 transition-all hover:bg-red-700 hover:shadow-xl active:scale-[0.98]">
          <Landmark size={18} /> New Loan
        </Link>
        ) : null}
      </div>

      {/* KPI Hero Row */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Loans" value={totalLoansDisplay}
          icon={Users} color="bg-white/20" bgGradient="bg-gradient-to-br from-red-600 to-red-800" />
        <StatCard label="Active Accounts" value={metrics.activeLoans}
          icon={CheckCircle2} color="bg-white/20" bgGradient="bg-gradient-to-br from-emerald-600 to-emerald-800"
          trend={`${overduePct}% overdue`} />
        <StatCard label="Collections (Month)" value={formatPeso(metrics.collectionsThisMonth)}
          icon={PiggyBank} color="bg-white/20" bgGradient="bg-gradient-to-br from-red-700 to-red-900" />
        <StatCard label="Outstanding" value={formatPeso(metrics.outstandingBalances)}
          icon={Landmark} color="bg-white/20" bgGradient="bg-gradient-to-br from-slate-700 to-slate-900"
          trend={collectionRate > 0 ? `${collectionRate}% collected` : undefined} />
      </div>

      {/* Status Breakdown */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900">Account Status Breakdown</h3>
          <p className="mt-0.5 text-xs text-slate-500">{totalLoansDisplay} total accounts</p>
          <div className="mt-5 space-y-3">
            {statusList.map((s) => {
              const val = metrics[s.key];
              const max = Math.max(totalLoansDisplay, 1);
              const pct = Math.round((val / max) * 100);
              const Icon = s.icon;
              return (
                <div key={s.key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`flex size-5 items-center justify-center rounded-md ${s.color} ${s.ring}`}>
                        <Icon size={11} className="text-white" />
                      </span>
                      <span className="font-medium text-slate-700">{s.label}</span>
                    </div>
                    <span className="font-bold text-slate-900">{val} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-2 rounded-full transition-all duration-700 ${s.color}`}
                      style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {isAdmin ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h3 className="text-sm font-bold text-slate-900">Financial Summary</h3>
          <p className="mt-0.5 text-xs text-slate-500">Principal, interest, collections, and capital</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <CompactCard label="Total Principal" value={formatPeso(metrics.totalPrincipal)} color="border-l-red-500" />
            <CompactCard label="Interest Earned" value={formatPeso(metrics.totalInterest)} color="border-l-emerald-500" />
            <CompactCard label="Total Collections" value={formatPeso(metrics.totalCollections)} color="border-l-red-600" />
            <CompactCard label="Capital Balance" value={formatPeso(metrics.capitalBalance)} color="border-l-blue-500" />
            <CompactCard label="Total Expenses" value={formatPeso(metrics.totalExpenses)} color="border-l-rose-500" />
            <CompactCard label="Outstanding Balance" value={formatPeso(metrics.outstandingBalances)} color="border-l-orange-500" />
          </div>
        </div>
        ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h3 className="text-sm font-bold text-slate-900">Today's Collection Targets</h3>
          <p className="mt-0.5 text-xs text-slate-500">{metrics.overdueLoans} overdue accounts need attention</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <CompactCard label="Overdue 1-30 Days" value={String(metrics.aging.days1to30)} color="border-l-amber-500" />
            <CompactCard label="Overdue 31-60 Days" value={String(metrics.aging.days31to60)} color="border-l-orange-500" />
            <CompactCard label="Overdue 61-90 Days" value={String(metrics.aging.days61to90)} color="border-l-rose-500" />
            <CompactCard label="Overdue 90+ Days" value={String(metrics.aging.days90plus)} color="border-l-red-500" />
          </div>
        </div>
        )}
      </div>

      {/* Collections Timeline + Aging */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">Collections</h3>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Today", value: formatPeso(metrics.collectionsToday), accent: "text-red-600" },
              { label: "This Week", value: formatPeso(metrics.collectionsThisWeek), accent: "text-amber-600" },
              { label: "This Month", value: formatPeso(metrics.collectionsThisMonth), accent: "text-emerald-600" },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                <p className="text-xs font-medium text-slate-500">{c.label}</p>
                <p className={`mt-1.5 text-lg font-bold ${c.accent}`}>{c.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Delinquency Aging</h3>
              <p className="mt-0.5 text-xs text-slate-500">{metrics.overdueLoans} overdue accounts</p>
            </div>
            <BarChart3 size={20} className="text-slate-400" />
          </div>
          <div className="mt-5 flex items-end gap-3 h-28">
            {([
              { val: metrics.aging.current, label: "Current", color: "bg-emerald-400" },
              { val: metrics.aging.days1to30, label: "1-30d", color: "bg-amber-400" },
              { val: metrics.aging.days31to60, label: "31-60d", color: "bg-orange-400" },
              { val: metrics.aging.days61to90, label: "61-90d", color: "bg-rose-400" },
              { val: metrics.aging.days90plus, label: "90d+", color: "bg-red-700" },
            ]).map((bar) => {
              const maxVal = Math.max(
                metrics.aging.current, metrics.aging.days1to30, metrics.aging.days31to60,
                metrics.aging.days61to90, metrics.aging.days90plus, 1,
              );
              const h = (bar.val / maxVal) * 100;
              return (
                <div key={bar.label} className="flex-1 flex flex-col items-center justify-end gap-2">
                  <span className="text-xs font-bold text-slate-700">{bar.val}</span>
                  <div className={`w-full rounded-t-lg transition-all duration-700 ${bar.color}`}
                    style={{ height: `${Math.max(h, 4)}%`, minHeight: 4 }} />
                  <span className="text-[10px] font-medium text-slate-500">{bar.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Capital & Expenses Summary */}
      {isAdmin ? (
      <div className="grid gap-6 lg:grid-cols-2">
        <Link href="/capital" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Banknote size={20} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Capital Balance</p>
              <p className="mt-0.5 text-lg font-bold text-slate-900">{formatPeso(metrics.capitalBalance)}</p>
            </div>
          </div>
        </Link>
        <Link href="/expenses" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Receipt size={20} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Expenses</p>
              <p className="mt-0.5 text-lg font-bold text-slate-900">{formatPeso(metrics.totalExpenses)}</p>
            </div>
          </div>
        </Link>
      </div>
      ) : null}

      {/* Needs Attention */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-3">Needs Attention</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {metrics.overdueLoans > 0 ? (
            <Link href="/loans?status=OVERDUE" className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 hover:bg-rose-100 transition-colors">
              <span className="text-sm font-bold text-rose-800">{metrics.overdueLoans} overdue</span>
              <span className="text-xs text-rose-600">View →</span>
            </Link>
          ) : null}
          {metrics.aging.days1to30 > 0 ? (
            <Link href="/loans?status=OVERDUE" className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 hover:bg-red-100 transition-colors">
              <span className="text-sm font-medium text-red-800">{metrics.aging.days1to30} due 1-30 days</span>
              <span className="text-xs text-red-600">View →</span>
            </Link>
          ) : null}
          {metrics.aging.days31to60 > 0 ? (
            <Link href="/loans?status=OVERDUE" className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 hover:bg-rose-100 transition-colors">
              <span className="text-sm font-bold text-rose-800">{metrics.aging.days31to60 + metrics.aging.days61to90 + metrics.aging.days90plus} overdue 31d+</span>
              <span className="text-xs text-rose-600">View →</span>
            </Link>
          ) : null}
          {metrics.activeLoans === 0 && metrics.overdueLoans === 0 ? (
            <span className="text-sm text-slate-500 col-span-full">All clear — no items need attention.</span>
          ) : null}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {[
          { href: "/loans", label: "View All Loans", icon: Landmark },
          { href: "/payments", label: "Payment Records", icon: DollarSign },
          ...(isAdmin ? [{ href: "/reports", label: "Reports & Exports", icon: FileText }] : []),
        ].map((link) => (
          <Link key={link.href} href={link.href}
            className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md">
            <link.icon size={16} className="text-slate-400" />
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
