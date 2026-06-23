import Decimal from "decimal.js";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { decimalToString } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { serializeLoanAccount, serializeLoanSchedule, serializePayment } from "@/lib/serializers";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const account = await prisma.loanAccount.findUnique({
      where: { id },
      include: {
        schedule: { orderBy: { periodNumber: "asc" } },
        payments: { where: { voided: false }, orderBy: { paymentDate: "asc" } },
      },
    });

    if (!account) {
      throw new NotFoundError("Loan account not found");
    }

    const generatedAt = new Intl.DateTimeFormat("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());

    const totalPayments = account.payments.reduce(
      (sum, p) => sum.plus(p.amount),
      new Decimal(0),
    );

    const todayManila = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const scheduleWithDaysOverdue = account.schedule.map((s) => {
      const serialized = serializeLoanSchedule(s);
      const dueDateOnly = new Date(s.dueDate).toISOString().slice(0, 10);
      const daysOverdue =
        s.status !== "PAID" && dueDateOnly < todayManila
          ? Math.floor(
              (new Date(`${todayManila}T00:00:00+08:00`).getTime() -
                new Date(`${dueDateOnly}T00:00:00+08:00`).getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : null;
      return { ...serialized, daysOverdue };
    });

    return NextResponse.json({
      statement: {
        generatedAt,
        loanAccount: serializeLoanAccount(account),
        schedule: scheduleWithDaysOverdue,
        payments: account.payments.map(serializePayment),
        totalPayments: decimalToString(totalPayments),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
