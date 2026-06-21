import Decimal from "decimal.js";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleApiError, readJson } from "@/lib/api";
import { parseDateOnly } from "@/lib/dates";
import { parsePositiveMoney } from "@/lib/money";
import { decimalToString } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { serializeExpense } from "@/lib/serializers";
import { createExpenseSchema } from "@/lib/validation";

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
    const type = searchParams.get("type") || "";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";

    const where: Record<string, unknown> = {};
    if (type === "SALARY" || type === "OTHER") {
      where.type = type;
    }
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.gte = new Date(from + "T00:00:00.000Z");
      if (to) dateFilter.lte = new Date(to + "T23:59:59.999Z");
      where.date = dateFilter;
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    const totals = await prisma.expense.groupBy({
      by: ["type"],
      where,
      _sum: { amount: true },
    });

    const salaryTotal = totals.find((t) => t.type === "SALARY")?._sum.amount || new Decimal(0);
    const otherTotal = totals.find((t) => t.type === "OTHER")?._sum.amount || new Decimal(0);

    return NextResponse.json({
      expenses: expenses.map(serializeExpense),
      summary: {
        salaryTotal: decimalToString(salaryTotal),
        otherTotal: decimalToString(otherTotal),
        grandTotal: decimalToString(salaryTotal.plus(otherTotal)),
      },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
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

    const body = createExpenseSchema.parse(await readJson(request));
    const amount = parsePositiveMoney(body.amount, "amount");
    const date = parseDateOnly(body.date, "date");

    const expense = await prisma.$transaction(async (tx) => {
      const lockedRows = await tx.$queryRawUnsafe<Array<{ balanceAfter: string }>>(
        `SELECT "balanceAfter" FROM "CapitalTransaction" ORDER BY "createdAt" DESC LIMIT 1 FOR UPDATE`,
      );
      const currentBalance = lockedRows.length > 0 ? new Decimal(lockedRows[0].balanceAfter) : new Decimal(0);
      const newBalance = currentBalance.minus(amount);

      if (newBalance.lt(0)) {
        throw new Error("INSUFFICIENT_CAPITAL");
      }
      const created = await tx.expense.create({
        data: {
          type: body.type,
          amount: decimalToString(amount),
          description: body.description || null,
          date,
          customFields: body.customFields as Prisma.InputJsonValue | undefined,
          postedBy: session.user?.id || null,
        },
      });

      // Auto-deduct from capital
      await tx.capitalTransaction.create({
        data: {
          type: "EXPENSE",
          amount: decimalToString(amount),
          balanceBefore: decimalToString(currentBalance),
          balanceAfter: decimalToString(newBalance),
          description: `Expense: ${body.type}${body.description ? ` - ${body.description}` : ""}`,
          referenceId: created.id,
          referenceType: "EXPENSE",
          performedBy: session.user?.id || null,
        },
      });

      return created;
    });

    return NextResponse.json(
      { expense: serializeExpense(expense) },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CAPITAL") {
      return NextResponse.json({ error: "Insufficient capital balance to record this expense" }, { status: 400 });
    }
    return handleApiError(error);
  }
}
