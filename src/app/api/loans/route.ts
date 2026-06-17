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
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" as const } },
      ];
    }
    if (status && ["ACTIVE", "OVERDUE", "FULLY_PAID"].includes(status)) {
      where.status = status;
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

    const schedule = generateDailySchedule(
      startDate,
      termDays,
      dailyInstallment,
      totalPayable,
    );

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + termDays);
    const nextDueDate = schedule[0]?.dueDate ?? startDate;

    const account = await prisma.$transaction(async (tx) => {
      const created = await tx.loanAccount.create({
        data: {
          customerName: body.customerName,
          customerPhone: body.customerPhone,
          customerAddress: body.customerAddress,
          idNumber: body.idNumber || null,
          validIdType: body.validIdType || null,
          principal: decimalToString(principal),
          interestRate: decimalToString(interestRate),
          interestAmount: decimalToString(interestAmount),
          processingFee: decimalToString(processingFee),
          totalPayable: decimalToString(totalPayable),
          termDays,
          dailyInstallment: decimalToString(dailyInstallment),
          remainingBalance: decimalToString(totalPayable),
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
      return created;
    });

    return NextResponse.json(
      { loanAccount: serializeLoanAccount(account) },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
