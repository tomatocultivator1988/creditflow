import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleApiError, readJson } from "@/lib/api";
import Decimal from "decimal.js";
import { parseDateOnly } from "@/lib/dates";
import { computeLoan } from "@/lib/loan-compute";
import { generateDailySchedule } from "@/lib/installment-schedule";
import { decimalToString, parseMoney, parsePositiveMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { serializeLoanAccount } from "@/lib/serializers";
import { createLoanSchema } from "@/lib/validation";

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
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const dueBefore = searchParams.get("dueBefore") || "";

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" as const } },
      ];
    }
    if (status && ["ACTIVE", "OVERDUE", "FULLY_PAID"].includes(status)) {
      where.status = status;
    }
    if (dueBefore) {
      const dueDate = new Date(dueBefore + "T23:59:59.999+08:00");
      where.nextDueDate = { lte: dueDate };
      where.status = { not: "FULLY_PAID" };
    }

    const [accounts, total] = await Promise.all([
      prisma.loanAccount.findMany({
        where,
        orderBy: { customerName: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.loanAccount.count({ where }),
    ]);

    return NextResponse.json({
      loanAccounts: accounts.map(serializeLoanAccount),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = createLoanSchema.parse(await readJson(request));

    const principal = parsePositiveMoney(body.principal, "principal");
    const interestRate = parseMoney(body.interestRate, "interestRate");
    const termDays = body.termDays;
    const startDate = parseDateOnly(body.startDate, "startDate");
    const processingFee = body.processingFee
      ? parsePositiveMoney(body.processingFee, "processingFee")
      : new Decimal(0);

    const { interestAmount, totalPayable, dailyInstallment } = computeLoan(
      principal,
      interestRate,
      termDays,
    );

    const finalTotalPayable = totalPayable.plus(processingFee);

    const schedule = generateDailySchedule(
      startDate,
      termDays,
      dailyInstallment,
      finalTotalPayable,
    );

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + termDays);
    const nextDueDate = schedule[0]?.dueDate ?? startDate;

    const account = await prisma.$transaction(async (tx) => {
      const created = await tx.loanAccount.create({
        data: {
          customerName: body.customerName,
          customerPhone: body.customerPhone,
          customerEmail: body.customerEmail || null,
          customerAddress: body.customerAddress,
          fbLink: body.fbLink || null,
          idNumber: body.idNumber || null,
          validIdType: body.validIdType || null,
          principal: decimalToString(principal),
          interestRate: decimalToString(interestRate),
          interestAmount: decimalToString(interestAmount),
          processingFee: decimalToString(processingFee),
          totalPayable: decimalToString(finalTotalPayable),
          termDays,
          dailyInstallment: decimalToString(dailyInstallment),
          remainingBalance: decimalToString(finalTotalPayable),
          status: "ACTIVE",
          startDate,
          endDate,
          nextDueDate,
          remarks: body.remarks || null,
          schedule: {
            create: schedule.map((s) => ({
              periodNumber: s.periodNumber,
              dueDate: s.dueDate,
              amount: decimalToString(s.amount),
              status: "PENDING",
            })),
          },
        },
      });
      const lastCapitalTx = await tx.$queryRawUnsafe<Array<{ balanceAfter: string }>>(
        `SELECT "balanceAfter" FROM "CapitalTransaction" ORDER BY "createdAt" DESC LIMIT 1 FOR UPDATE`,
      );
      const currentBalance = lastCapitalTx.length > 0
        ? new Decimal(lastCapitalTx[0].balanceAfter)
        : new Decimal(0);
      const newBalance = currentBalance.minus(principal);

      if (currentBalance.gt(0) && newBalance.lt(0)) {
        throw new Error("INSUFFICIENT_CAPITAL");
      }

      await tx.capitalTransaction.create({
        data: {
          type: "LOAN",
          amount: decimalToString(principal),
          balanceBefore: decimalToString(currentBalance),
          balanceAfter: decimalToString(newBalance),
          description: `Loan disbursement - ${body.customerName}`,
          referenceId: created.id,
          referenceType: "LOAN",
          performedBy: session.user?.id || null,
        },
      });

      return created;
    });

    return NextResponse.json(
      { loanAccount: serializeLoanAccount(account) },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CAPITAL") {
      return NextResponse.json({ error: "Insufficient capital balance to create this loan" }, { status: 400 });
    }
    return handleApiError(error);
  }
}
