import type { LoanStatusValue, ScheduleStatusValue } from "@/types/api";
import { getLoanStatusDisplay } from "@/lib/loan-status";

type BadgeStatus = LoanStatusValue | ScheduleStatusValue;

const baseClasses =
  "inline-flex min-w-20 items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold";

const classMap: Record<string, string> = {
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  OVERDUE: "border-rose-200 bg-rose-50 text-rose-700",
  FULLY_PAID: "border-slate-200 bg-slate-100 text-slate-700",
  PAID: "border-slate-200 bg-slate-100 text-slate-700",
  PENDING: "border-slate-200 bg-white text-slate-600",
  PARTIAL: "border-amber-200 bg-amber-50 text-amber-700",
  "DUE TODAY": "border-amber-200 bg-amber-50 text-amber-700",
  "DUE TOMORROW": "border-amber-200 bg-amber-50 text-amber-700",
};

const overdueClass = "border-rose-200 bg-rose-50 text-rose-700";

function badgeClass(label: string): string {
  if (classMap[label]) return classMap[label];
  if (/^DUE \d+ DAYS AGO$/.test(label)) return overdueClass;
  return classMap.ACTIVE;
}

export function StatusBadge({ status, nextDueDate }: { status: BadgeStatus; nextDueDate?: string | null }) {
  const label = nextDueDate ? getLoanStatusDisplay(status, nextDueDate) : status;
  return <span className={`${baseClasses} ${badgeClass(label)}`}>{label}</span>;
}
