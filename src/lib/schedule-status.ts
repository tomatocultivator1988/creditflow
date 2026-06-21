import { prisma } from "@/lib/prisma";

type ScheduleTx = {
  loanSchedule: {
    updateMany: (args: {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    }) => Promise<unknown>;
  };
};

export async function updateOverdueSchedule(
  loanAccountId: string,
  tx?: ScheduleTx,
): Promise<void> {
  const db = (tx ?? prisma) as typeof prisma;
  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
  }).format(new Date());
  const todayDate = new Date(todayStr + "T00:00:00.000+08:00");

  await db.loanSchedule.updateMany({
    where: {
      loanAccountId,
      status: { in: ["PENDING", "PARTIAL"] },
      dueDate: { lt: todayDate },
    },
    data: { status: "OVERDUE" },
  });

  await db.loanSchedule.updateMany({
    where: {
      loanAccountId,
      status: "OVERDUE",
      paidAmount: null,
      dueDate: { gte: todayDate },
    },
    data: { status: "PENDING" },
  });

  await db.loanSchedule.updateMany({
    where: {
      loanAccountId,
      status: "OVERDUE",
      paidAmount: { not: null },
      dueDate: { gte: todayDate },
    },
    data: { status: "PARTIAL" },
  });
}
