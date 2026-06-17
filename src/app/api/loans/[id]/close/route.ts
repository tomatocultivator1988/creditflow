import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
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

    const existing = await prisma.loanAccount.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Loan account not found");
    if (existing.status === "FULLY_PAID") {
      return NextResponse.json({ error: "Loan is already fully paid" }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.loanSchedule.updateMany({
        where: { loanAccountId: id, status: { not: "PAID" } },
        data: { status: "PAID", paidDate: new Date() },
      });
      return tx.loanAccount.update({
        where: { id },
        data: {
          status: "FULLY_PAID",
          remainingBalance: 0,
        },
      });
    });

    return NextResponse.json({ loanAccount: serializeLoanAccount(updated) });
  } catch (error) {
    return handleApiError(error);
  }
}
