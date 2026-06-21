import Decimal from "decimal.js";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleApiError, readJson, withRetry } from "@/lib/api";
import { parseDateOnly } from "@/lib/dates";
import { NotFoundError } from "@/lib/errors";
import { decimalToString } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { recalculateBalance } from "@/lib/balance";
import { serializePayment } from "@/lib/serializers";
import { createPaymentSchema } from "@/lib/validation";
import { sendPaymentReceipt } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        orderBy: { paymentDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count(),
    ]);

    return NextResponse.json({
      payments: payments.map(serializePayment),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = createPaymentSchema.parse(await readJson(request));
    const paymentDate = parseDateOnly(body.paymentDate, "paymentDate");

    const result = await withRetry(() =>
      prisma.$transaction(async (tx) => {
        const account = await tx.loanAccount.findUnique({
          where: { id: body.loanAccountId },
          include: { schedule: { orderBy: { periodNumber: "asc" } } },
        });

        if (!account) {
          throw new NotFoundError("Loan account not found");
        }

        if (account.status === "FULLY_PAID") {
          throw new NotFoundError("Cannot post payment to a fully paid account");
        }

        const totalAmount = new Decimal(body.amount);

        // Mark overdue schedules
        const phDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(paymentDate);
        const paymentDateMidnight = new Date(phDate + "T00:00:00.000+08:00");

        await tx.loanSchedule.updateMany({
          where: {
            loanAccountId: account.id,
            status: { in: ["PENDING"] },
            dueDate: { lt: paymentDateMidnight },
          },
          data: { status: "OVERDUE" },
        });

        // Update in-memory schedule
        for (const s of account.schedule) {
          if (s.status === "PENDING" && s.dueDate < paymentDateMidnight) {
            s.status = "OVERDUE";
          }
        }

        // Apply payment FIFO to unpaid periods
        let remaining = totalAmount;
        const updates: Array<{
          id: string;
          status: string;
          paidDate: Date;
          paymentId: string;
          paidAmount: string;
        }> = [];

        for (const period of account.schedule) {
          if (remaining.lte(0)) break;
          if (period.status === "PAID") continue;

          const scheduledAmount = new Decimal(period.amount);
          const alreadyPaid = period.paidAmount ? new Decimal(period.paidAmount) : new Decimal(0);
          const remainingPeriod = scheduledAmount.minus(alreadyPaid);

          if (remainingPeriod.lte(0)) continue;

          const applied = Decimal.min(remaining, remainingPeriod);
          const newPaidAmount = alreadyPaid.plus(applied);

          updates.push({
            id: period.id,
            status: (applied.gte(remainingPeriod) ? "PAID" : "PARTIAL") as "PAID" | "PARTIAL",
            paidDate: paymentDate,
            paymentId: "__pending__",
            paidAmount: decimalToString(newPaidAmount),
          });

          remaining = remaining.minus(applied);
        }

        // Compute actual applied amount before creating payment
        const appliedAmount = totalAmount.minus(remaining);
        const actualCollection = appliedAmount.gt(0) ? appliedAmount : new Decimal(0);

        // Create payment
        const createdPayment = await tx.payment.create({
          data: {
            loanAccountId: body.loanAccountId,
            customerName: account.customerName,
            amount: decimalToString(actualCollection),
            paymentDate,
            notes: body.notes || null,
            postedBy: session.user?.id || null,
          },
        });

        // Update schedule rows with real paymentId
        await Promise.all(
          updates.map((u) =>
            tx.loanSchedule.update({
              where: { id: u.id },
              data: {
                status: u.status as "PAID" | "PARTIAL",
                paidDate: u.paidDate,
                paidAmount: u.paidAmount,
                paymentId: createdPayment.id,
              },
            }),
          ),
        );

        // Recalculate balance
        const { balance: newRemainingBalance } = await recalculateBalance(
          tx as unknown as Parameters<typeof recalculateBalance>[0],
          account.id,
        );

        // Create capital transaction for collection (locked read)
        const lockedRows = await tx.$queryRawUnsafe<Array<{ balanceAfter: string }>>(
          `SELECT "balanceAfter" FROM "CapitalTransaction" ORDER BY "createdAt" DESC LIMIT 1 FOR UPDATE`,
        );
        const currentBalance = lockedRows.length > 0
          ? new Decimal(lockedRows[0].balanceAfter)
          : new Decimal(0);
        const newBalance = currentBalance.plus(actualCollection);

        await tx.capitalTransaction.create({
          data: {
            type: "COLLECTION",
            amount: decimalToString(actualCollection),
            balanceBefore: decimalToString(currentBalance),
            balanceAfter: decimalToString(newBalance),
            description: `Payment collection - ${account.customerName}`,
            referenceId: createdPayment.id,
            referenceType: "PAYMENT",
            performedBy: session.user?.id || null,
          },
        });

        return {
          payment: createdPayment,
          emailData: account.customerEmail
            ? {
                customerEmail: account.customerEmail,
                customerName: account.customerName,
                paymentId: createdPayment.id,
                paymentDate: body.paymentDate,
                amount: decimalToString(actualCollection),
                principal: decimalToString(account.principal),
                interestRate: decimalToString(account.interestRate),
                termDays: account.termDays,
                dailyInstallment: decimalToString(account.dailyInstallment),
                remainingBalance: decimalToString(newRemainingBalance),
                notes: body.notes || null,
                collector: (session.user as any)?.name || null,
              }
            : null,
        };
      }),
    );

    // Fire-and-forget email receipt (never blocks payment)
    if (result.emailData) {
      sendPaymentReceipt(result.emailData).catch((err) =>
        console.error("Receipt email failed:", err),
      );
    }

    return NextResponse.json(
      { payment: serializePayment(result.payment) },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
