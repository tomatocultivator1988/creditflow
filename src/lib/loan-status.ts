export function getLoanStatusDisplay(status: string, nextDueDate: string | null): string {
  if (!nextDueDate || status === "FULLY_PAID") {
    return status === "FULLY_PAID" ? "FULLY PAID" : status;
  }

  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
  const today = new Date(todayStr);
  const due = new Date(nextDueDate);
  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (status === "ACTIVE") {
    if (diffDays === 0) return "DUE TODAY";
    if (diffDays === 1) return "DUE TOMORROW";
    return "ACTIVE";
  }

  if (status === "OVERDUE") {
    if (diffDays === 0) return "DUE TODAY";
    if (diffDays === -1) return "DUE 1 DAY AGO";
    if (diffDays === -2) return "DUE 2 DAYS AGO";
    if (diffDays === -3) return "DUE 3 DAYS AGO";
    if (diffDays < 0) return `DUE ${Math.abs(diffDays)} DAYS AGO`;
    return "OVERDUE";
  }

  return status;
}
