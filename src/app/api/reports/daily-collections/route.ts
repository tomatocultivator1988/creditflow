import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { serializePayment } from "@/lib/serializers";
import { getManilaDayRange } from "@/lib/dates";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");

    let start: Date;
    let end: Date;
    if (dateStr) {
      start = new Date(dateStr + "T00:00:00.000+08:00");
      end = new Date(start.getTime() + 86400000);
    } else {
      const range = getManilaDayRange();
      start = range.start;
      end = range.end;
    }

    const payments = await prisma.payment.findMany({
      where: {
        paymentDate: { gte: start, lt: end }, voided: false,
      },
      orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json({
      payments: payments.map(serializePayment),
      date: start.toISOString().slice(0, 10),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
