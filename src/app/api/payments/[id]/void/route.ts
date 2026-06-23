import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleApiError, readJson } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { recalculateBalance } from "@/lib/balance";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = (await readJson(request)) as { reason?: string };

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { schedules: true },
    });

    if (!payment) {
      throw new NotFoundError("Payment not found");
    }

    if (payment.voided) {
      return NextResponse.json(
        { error: "Payment is already voided" },
        { status: 400 },
      );
    }

    // Only the latest non-voided payment for this loan can be voided
    const latestNonVoided = await prisma.payment.findFirst({
      where: { loanAccountId: payment.loanAccountId, voided: false },
      orderBy: [{ paymentDate: "desc" }, { createdAt: "desc" }],
    });

    if (latestNonVoided && latestNonVoided.id !== id) {
      return NextResponse.json(
        {
          error:
            "Only the latest payment can be voided. Voiding older payments would corrupt the account finances.",
        },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      // Reset affected schedule periods to PENDING
      await tx.loanSchedule.updateMany({
        where: { paymentId: id },
        data: {
          status: "PENDING",
          paidDate: null,
          paymentId: null,
          paidAmount: null,
        },
      });

      // Mark payment as voided
      await tx.payment.update({
        where: { id },
        data: {
          voided: true,
          voidedAt: new Date(),
          voidReason: body.reason || null,
        },
      });

      // Recalculate balance
      await recalculateBalance(
        tx as unknown as Parameters<typeof recalculateBalance>[0],
        payment.loanAccountId,
      );

      // Activity log
      await tx.activityLog.create({
        data: {
          accountId: payment.loanAccountId,
          action: "VOID_PAYMENT",
          details: `Voided payment ₱${payment.amount} — ${body.reason || "No reason provided"}`,
          paymentId: id,
          performedBy: session.user?.id || null,
        },
      });
    });

    return NextResponse.json({ message: "Payment voided successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
