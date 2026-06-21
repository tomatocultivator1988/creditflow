import Decimal from "decimal.js";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleApiError, readJson } from "@/lib/api";
import { parsePositiveMoney } from "@/lib/money";
import { decimalToString } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { serializeCapitalTransaction } from "@/lib/serializers";
import { addCapitalSchema, withdrawCapitalSchema } from "@/lib/validation";

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

    const where: Record<string, unknown> = {};
    if (type && ["ADD", "WITHDRAW", "LOAN", "COLLECTION", "EXPENSE"].includes(type)) {
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      prisma.capitalTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.capitalTransaction.count({ where }),
    ]);

    const lastTx = await prisma.capitalTransaction.findFirst({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      balance: lastTx ? decimalToString(lastTx.balanceAfter) : "0.00",
      transactions: transactions.map(serializeCapitalTransaction),
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

    const body = await readJson(request) as Record<string, unknown>;
    const action = body._action as string;

    if (action === "add") {
      const parsed = addCapitalSchema.parse(body);
      const amount = parsePositiveMoney(parsed.amount, "amount");

      const created = await prisma.$transaction(async (prismaTx) => {
        const lockedRows = await prismaTx.$queryRawUnsafe<Array<{ balanceAfter: string }>>(
          `SELECT "balanceAfter" FROM "CapitalTransaction" ORDER BY "createdAt" DESC LIMIT 1 FOR UPDATE`,
        );
        const currentBalance = lockedRows.length > 0
          ? new Decimal(lockedRows[0].balanceAfter)
          : new Decimal(0);
        const newBalance = currentBalance.plus(amount);

        return prismaTx.capitalTransaction.create({
          data: {
            type: "ADD",
            amount: decimalToString(amount),
            balanceBefore: decimalToString(currentBalance),
            balanceAfter: decimalToString(newBalance),
            description: parsed.description || "Capital added",
            performedBy: session.user?.id || null,
          },
        });
      });

      return NextResponse.json(
        { capitalTransaction: serializeCapitalTransaction(created) },
        { status: 201 },
      );
    }

    if (action === "withdraw") {
      const parsed = withdrawCapitalSchema.parse(body);
      const amount = parsePositiveMoney(parsed.amount, "amount");

      const created = await prisma.$transaction(async (prismaTx) => {
        const lockedRows = await prismaTx.$queryRawUnsafe<Array<{ balanceAfter: string }>>(
          `SELECT "balanceAfter" FROM "CapitalTransaction" ORDER BY "createdAt" DESC LIMIT 1 FOR UPDATE`,
        );
        const currentBalance = lockedRows.length > 0
          ? new Decimal(lockedRows[0].balanceAfter)
          : new Decimal(0);

        if (amount.gt(currentBalance)) {
          throw new Error("INSUFFICIENT_BALANCE");
        }

        const newBalance = currentBalance.minus(amount);
        return prismaTx.capitalTransaction.create({
          data: {
            type: "WITHDRAW",
            amount: decimalToString(amount),
            balanceBefore: decimalToString(currentBalance),
            balanceAfter: decimalToString(newBalance),
            description: parsed.description || "Capital withdrawal",
            performedBy: session.user?.id || null,
          },
        });
      });

      return NextResponse.json(
        { capitalTransaction: serializeCapitalTransaction(created) },
        { status: 201 },
      );
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json({ error: "Insufficient capital balance" }, { status: 400 });
    }
    return handleApiError(error);
  }
}
