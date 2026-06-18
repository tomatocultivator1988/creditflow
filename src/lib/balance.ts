import Decimal from "decimal.js";
import { decimalToString } from "@/lib/money";

type TxType = {
  loanSchedule: { findMany: (args: Record<string, unknown>) => Promise<Array<Record<string, unknown>>> };
  loanAccount: {
    findUnique: (args: Record<string, unknown>) => Promise<Record<string, unknown> | null>;
    update: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
  };
};

export async function recalculateBalance(
  tx: TxType,
  loanAccountId: string,
): Promise<{ balance: Decimal; status: string; nextDueDate: Date | null }> {
  const schedule = await tx.loanSchedule.findMany({
    where: { loanAccountId },
  });

  const newBalance = schedule
    .filter(
      (s) =>
        s.status === "PENDING" ||
        s.status === "PARTIAL" ||
        s.status === "OVERDUE",
    )
    .reduce((sum, s) => {
      const remainingAmt = Decimal.max(
        0,
        new Decimal(s.amount as string).minus(
          s.paidAmount ? new Decimal(s.paidAmount as string) : 0,
        ),
      );
      return sum.plus(remainingAmt);
    }, new Decimal(0))
    .toDecimalPlaces(2);

  const unpaid = schedule
    .filter(
      (s) =>
        s.status === "PENDING" ||
        s.status === "PARTIAL" ||
        s.status === "OVERDUE",
    )
    .sort(
      (a, b) =>
        (a.periodNumber as number) - (b.periodNumber as number),
    );

  const nextDue = unpaid[0]?.dueDate as Date | null ?? null;

  let status = "ACTIVE";
  if (newBalance.eq(0)) {
    status = "FULLY_PAID";
  } else if (nextDue) {
    const todayStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila",
    }).format(new Date());
    const dueStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila",
    }).format(nextDue);
    if (todayStr > dueStr) status = "OVERDUE";
  }

  const updateData: Record<string, unknown> = {
    remainingBalance: decimalToString(newBalance),
    status,
  };
  if (nextDue) {
    updateData.nextDueDate = nextDue;
  } else {
    updateData.nextDueDate = null;
  }

  await tx.loanAccount.update({
    where: { id: loanAccountId },
    data: updateData,
  });

  return { balance: newBalance, status, nextDueDate: nextDue };
}
