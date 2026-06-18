import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { serializeLoanAccount } from "@/lib/serializers";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existing = await prisma.loanAccount.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Loan account not found");
    if (existing.released) {
      return NextResponse.json({ error: "Loan is already released" }, { status: 400 });
    }

    const updated = await prisma.loanAccount.update({
      where: { id },
      data: {
        released: true,
        releasedAt: new Date(),
        releasedBy: session.user.id,
      },
    });

    return NextResponse.json({ loanAccount: serializeLoanAccount(updated) });
  } catch (error) {
    return handleApiError(error);
  }
}
