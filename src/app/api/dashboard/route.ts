import { NextResponse } from "next/server";
import Decimal from "decimal.js";
import { auth } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { decimalToString } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [statusCounts, loanAggsResult, paymentAggsResult, agingResult, capitalResult, expenseResult] =
      await Promise.all([
        prisma.loanAccount.groupBy({ by: ["status"], _count: true }),

        prisma.$queryRawUnsafe<
          Array<{
            total_principal: string;
            total_interest: string;
            total_outstanding: string;
          }>
        >(
          `SELECT
            COALESCE(SUM("principal"), 0)::text AS "total_principal",
            COALESCE(SUM("interestAmount"), 0)::text AS "total_interest",
            COALESCE(SUM(CASE WHEN "status" IN ('ACTIVE', 'OVERDUE') THEN "remainingBalance" ELSE 0 END), 0)::text AS "total_outstanding"
          FROM "LoanAccount"`,
        ),

        prisma.$queryRawUnsafe<
          Array<{
            total_collections: string;
            today: string;
            week: string;
            month: string;
          }>
        >(
          `SELECT
            COALESCE(SUM("amount"), 0)::text AS "total_collections",
            COALESCE(SUM(CASE WHEN "paymentDate" >= $1::timestamp AND "paymentDate" < $2::timestamp THEN "amount" ELSE 0 END), 0)::text AS "today",
            COALESCE(SUM(CASE WHEN "paymentDate" >= $3::timestamp AND "paymentDate" < $4::timestamp THEN "amount" ELSE 0 END), 0)::text AS "week",
            COALESCE(SUM(CASE WHEN "paymentDate" >= $5::timestamp AND "paymentDate" < $6::timestamp THEN "amount" ELSE 0 END), 0)::text AS "month"
          FROM "Payment"`,
          todayStart,
          todayEnd,
          weekStart,
          weekEnd,
          monthStart,
          monthEnd,
        ),

        prisma.$queryRawUnsafe<
          Array<{
            days1to30: number;
            days31to60: number;
            days61to90: number;
            days90plus: number;
          }>
        >(
          `SELECT
            COUNT(*) FILTER (WHERE days_overdue BETWEEN 1 AND 30)::int AS "days1to30",
            COUNT(*) FILTER (WHERE days_overdue BETWEEN 31 AND 60)::int AS "days31to60",
            COUNT(*) FILTER (WHERE days_overdue BETWEEN 61 AND 90)::int AS "days61to90",
            COUNT(*) FILTER (WHERE days_overdue > 90)::int AS "days90plus"
          FROM (
            SELECT CURRENT_DATE - MIN(sub.due_date)::date AS days_overdue
            FROM (
              SELECT s."loanAccountId", s."dueDate" as due_date
              FROM "LoanSchedule" s
              JOIN "LoanAccount" a ON a.id = s."loanAccountId"
              WHERE a."status" = 'OVERDUE'
                AND s."status" IN ('PENDING', 'OVERDUE', 'PARTIAL')
                AND s."dueDate" < CURRENT_DATE
            ) sub
            GROUP BY sub."loanAccountId"
          ) aged`,
        ),

        prisma.capitalTransaction.findFirst({
          orderBy: { createdAt: "desc" },
          select: { balanceAfter: true },
        }),

        prisma.expense.groupBy({
          by: ["type"],
          _sum: { amount: true },
        }),
      ]);

    const countMap: Record<string, number> = {};
    for (const row of statusCounts) {
      countMap[row.status] = row._count;
    }

    const loanAggs = loanAggsResult[0] ?? {
      total_principal: "0",
      total_interest: "0",
      total_outstanding: "0",
    };
    const paymentAggs = paymentAggsResult[0] ?? {
      total_collections: "0",
      today: "0",
      week: "0",
      month: "0",
    };
    const agingData = agingResult[0] ?? {
      days1to30: 0,
      days31to60: 0,
      days61to90: 0,
      days90plus: 0,
    };

    const capitalBalance = capitalResult?.balanceAfter
      ? decimalToString(capitalResult.balanceAfter)
      : "0.00";

    let salaryTotal = new Decimal(0);
    let otherTotal = new Decimal(0);
    for (const row of expenseResult) {
      if (row.type === "SALARY") salaryTotal = row._sum.amount ?? new Decimal(0);
      if (row.type === "OTHER") otherTotal = row._sum.amount ?? new Decimal(0);
    }

    return NextResponse.json({
      metrics: {
        totalLoans:
          (countMap.ACTIVE ?? 0) +
          (countMap.OVERDUE ?? 0) +
          (countMap.FULLY_PAID ?? 0),
        activeLoans: countMap.ACTIVE ?? 0,
        overdueLoans: countMap.OVERDUE ?? 0,
        fullyPaidLoans: countMap.FULLY_PAID ?? 0,
        totalPrincipal: decimalToString(
          new Decimal(loanAggs.total_principal),
        ),
        totalInterest: decimalToString(
          new Decimal(loanAggs.total_interest),
        ),
        totalCollections: decimalToString(
          new Decimal(paymentAggs.total_collections),
        ),
        outstandingBalances: decimalToString(
          new Decimal(loanAggs.total_outstanding),
        ),
        collectionsToday: decimalToString(new Decimal(paymentAggs.today)),
        collectionsThisWeek: decimalToString(new Decimal(paymentAggs.week)),
        collectionsThisMonth: decimalToString(
          new Decimal(paymentAggs.month),
        ),
        capitalBalance,
        totalExpenses: decimalToString(salaryTotal.plus(otherTotal)),
        salaryExpenses: decimalToString(salaryTotal),
        otherExpenses: decimalToString(otherTotal),
        aging: {
          current: countMap.ACTIVE ?? 0,
          days1to30: agingData.days1to30,
          days31to60: agingData.days31to60,
          days61to90: agingData.days61to90,
          days90plus: agingData.days90plus,
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
