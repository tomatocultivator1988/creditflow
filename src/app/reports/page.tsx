"use client";

import Link from "next/link";
import {
  CalendarCheck,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";

const reportLinks = [
  {
    href: "/reports/daily-collections",
    label: "Daily Collections",
    description: "Daily breakdown of payment collections",
    icon: CalendarCheck,
  },
  {
    href: "/reports/monthly-collections",
    label: "Monthly Collections",
    description: "Monthly summary of all collections",
    icon: CalendarCheck,
  },
  {
    href: "/reports/overdue-accounts",
    label: "Overdue Accounts",
    description: "All overdue loan accounts and their balances",
    icon: AlertTriangle,
  },
  {
    href: "/reports/outstanding-balances",
    label: "Outstanding Balances",
    description: "All active and overdue loans with remaining balances",
    icon: DollarSign,
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="JBV Credit Collection Services reports" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {reportLinks.map((report) => {
          const Icon = report.icon;

          return (
            <Link
              key={report.href}
              href={report.href}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700 ring-1 ring-red-200 transition-colors group-hover:bg-red-100">
                  <Icon size={21} aria-hidden="true" />
                </span>
                <div>
                  <div className="text-sm font-bold font-heading text-slate-900 group-hover:text-red-800 transition-colors">
                    {report.label}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {report.description}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
