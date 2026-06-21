import { NextResponse } from "next/server";
import Decimal from "decimal.js";
import { auth } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { decimalToString } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { serializeLoanAccount } from "@/lib/serializers";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.loanAccount.findUnique({ where: { id } });
      if (!existing) throw new NotFoundError("Loan account not found");
      if (existing.status === "FULLY_PAID") {
        throw new NotFoundError("Loan is already fully paid");
      }

      await tx.loanSchedule.updateMany({
        where: { loanAccountId: id, status: { not: "PAID" } },
        data: { status: "PAID", paidDate: new Date(), paidAmount: undefined },
      });

      const lastCapital = await tx.$queryRawUnsafe<Array<{ balanceAfter: string }>>(
        `SELECT "balanceAfter" FROM "CapitalTransaction" ORDER BY "createdAt" DESC LIMIT 1 FOR UPDATE`,
      );
      const currentBalance = lastCapital.length > 0 ? new Decimal(lastCapital[0].balanceAfter) : new Decimal(0);
      await tx.capitalTransaction.create({
        data: {
          type: "WRITE_OFF",
          amount: decimalToString(existing.remainingBalance),
          balanceBefore: decimalToString(currentBalance),
          balanceAfter: decimalToString(currentBalance),
          description: `Loan force-closed - ${existing.customerName}`,
          referenceId: id,
          referenceType: "LOAN",
          performedBy: session.user?.id || null,
        },
      });

      return tx.loanAccount.update({
        where: { id },
        data: { status: "FULLY_PAID", remainingBalance: 0 },
      });
    });

    return NextResponse.json({ loanAccount: serializeLoanAccount(updated) });
  } catch (error) {
    return handleApiError(error);
  }
}
