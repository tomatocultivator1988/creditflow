import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { serializeLoanSchedule } from "@/lib/serializers";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const schedule = await prisma.loanSchedule.findMany({
      where: { loanAccountId: id },
      orderBy: { periodNumber: "asc" },
    });

    return NextResponse.json({
      schedule: schedule.map(serializeLoanSchedule),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
