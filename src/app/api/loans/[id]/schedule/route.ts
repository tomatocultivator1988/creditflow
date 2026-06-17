import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { serializeLoanSchedule } from "@/lib/serializers";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
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
