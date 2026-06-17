import { prisma } from "@/lib/prisma";

export async function updateOverdueSchedule(
  loanAccountId: string,
): Promise<void> {
  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
  }).format(new Date());
  const todayDate = new Date(todayStr + "T00:00:00.000+08:00");

  await prisma.loanSchedule.updateMany({
    where: {
      loanAccountId,
      status: { in: ["PENDING"] },
      dueDate: { lt: todayDate },
    },
    data: { status: "OVERDUE" },
  });

  await prisma.loanSchedule.updateMany({
    where: {
      loanAccountId,
      status: "OVERDUE",
      paidAmount: null,
      dueDate: { gte: todayDate },
    },
    data: { status: "PENDING" },
  });

  await prisma.loanSchedule.updateMany({
    where: {
      loanAccountId,
      status: "OVERDUE",
      paidAmount: { not: null },
      dueDate: { gte: todayDate },
    },
    data: { status: "PARTIAL" },
  });
}
