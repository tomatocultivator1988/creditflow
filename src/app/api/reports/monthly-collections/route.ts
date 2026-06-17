import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { decimalToString } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const year = Number(searchParams.get("year")) || new Date().getFullYear();

    const rows = await prisma.$queryRawUnsafe<
      Array<{
        month: number;
        total: string;
        count: number;
      }>
    >(
      `SELECT
        EXTRACT(MONTH FROM "paymentDate")::int AS "month",
        COALESCE(SUM("amount"), 0)::text AS "total",
        COUNT(*)::int AS "count"
      FROM "Payment"
      WHERE EXTRACT(YEAR FROM "paymentDate") = $1::int
      GROUP BY "month"
      ORDER BY "month"`,
      year,
    );

    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const found = rows.find((r) => r.month === i + 1);
      return {
        month: i + 1,
        total: found ? decimalToString(found.total) : "0.00",
        count: found?.count ?? 0,
      };
    });

    return NextResponse.json({ year, monthlyData });
  } catch (error) {
    return handleApiError(error);
  }
}
