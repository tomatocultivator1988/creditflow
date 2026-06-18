import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleApiError, readJson } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { recalculateBalance } from "@/lib/balance";
import { updateOverdueSchedule } from "@/lib/schedule-status";
import { serializeLoanAccount } from "@/lib/serializers";
import { updateLoanSchema } from "@/lib/validation";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const account = await prisma.loanAccount.findUnique({ where: { id } });

    if (!account) {
      throw new NotFoundError("Loan account not found");
    }

    await updateOverdueSchedule(id);

    const updated = await prisma.$transaction(async (tx) => {
      await recalculateBalance(tx as unknown as Parameters<typeof recalculateBalance>[0], id);
      return tx.loanAccount.findUnique({ where: { id } });
    });

    if (!updated) {
      throw new NotFoundError("Loan account not found after balance update");
    }

    return NextResponse.json({
      loanAccount: serializeLoanAccount(updated),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = updateLoanSchema.parse(await readJson(request));

    const existing = await prisma.loanAccount.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Loan account not found");

    const updated = await prisma.loanAccount.update({
      where: { id },
      data: {
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerEmail: body.customerEmail || null,
        customerAddress: body.customerAddress,
        fbLink: body.fbLink || null,
        idNumber: body.idNumber || null,
        validIdType: body.validIdType || null,
        remarks: body.remarks ?? null,
      },
    });

    return NextResponse.json({ loanAccount: serializeLoanAccount(updated) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;

    await prisma.$transaction(async (tx) => {
      const paymentIdList = (await tx.payment.findMany({
        where: { loanAccountId: id },
        select: { id: true },
      })).map((p) => p.id);

      await tx.capitalTransaction.deleteMany({
        where: {
          OR: [
            { referenceId: id, referenceType: "LOAN" },
            ...(paymentIdList.length > 0
              ? [{ referenceId: { in: paymentIdList }, referenceType: "PAYMENT" }]
              : []),
          ],
        },
      });

      await tx.activityLog.deleteMany({ where: { accountId: id } });
      await tx.payment.deleteMany({ where: { loanAccountId: id } });
      await tx.loanSchedule.deleteMany({ where: { loanAccountId: id } });
      await tx.loanAccount.delete({ where: { id } });
    });

    return NextResponse.json({ message: "Loan and all associated records permanently deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
