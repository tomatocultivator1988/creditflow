import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { decimalToString } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));
    const dateParam = searchParams.get("date") || "";

    const where: Record<string, unknown> = { status: "OVERDUE" };

    if (dateParam) {
      const filterDate = new Date(dateParam + "T23:59:59.999+08:00");
      where.nextDueDate = { lte: filterDate };
    }

    const todayManila = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
    const todayDate = new Date(todayManila + "T00:00:00.000+08:00");

    const [accounts, total] = await Promise.all([
      prisma.loanAccount.findMany({
        where,
        orderBy: { nextDueDate: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.loanAccount.count({ where }),
    ]);

    const rows = await Promise.all(
      accounts.map(async (a) => {
        const diffMs = a.nextDueDate
          ? todayDate.getTime() - new Date(a.nextDueDate).getTime()
          : 0;
        const daysOverdue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

        const lastPayment = await prisma.payment.findFirst({
          where: { loanAccountId: a.id, voided: false },
          orderBy: { paymentDate: "desc" },
          select: { paymentDate: true, amount: true },
        });

        const lastPaymentDate = lastPayment
          ? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(lastPayment.paymentDate)
          : null;

        return {
          id: a.id,
          customerName: a.customerName,
          customerPhone: a.customerPhone,
          principal: decimalToString(a.principal),
          dailyInstallment: decimalToString(a.dailyInstallment),
          remainingBalance: decimalToString(a.remainingBalance),
          nextDueDate: a.nextDueDate
            ? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(a.nextDueDate)
            : null,
          status: a.status,
          daysOverdue,
          lastPaymentDate,
          lastPaymentAmount: lastPayment ? decimalToString(lastPayment.amount) : null,
        };
      }),
    );

    return NextResponse.json({
      accounts: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
