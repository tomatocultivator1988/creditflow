import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { serializeLoanAccount } from "@/lib/serializers";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const accounts = await prisma.loanAccount.findMany({
      where: { status: "OVERDUE" },
      orderBy: { remainingBalance: "desc" },
    });

    return NextResponse.json({
      accounts: accounts.map(serializeLoanAccount),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
