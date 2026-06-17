import Decimal from "decimal.js";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleApiError, readJson } from "@/lib/api";
import { parseMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { updateAdminConfigSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let config = await prisma.adminConfig.findFirst();

    if (!config) {
      config = await prisma.adminConfig.create({
        data: {
          defaultInterestRate: new Decimal("5.00"),
          termOptions: [30, 60, 90, 120, 150, 180],
        },
      });
    }

    return NextResponse.json({
      config: {
        id: config.id,
        defaultInterestRate: config.defaultInterestRate.toFixed(2),
        termOptions: config.termOptions,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = updateAdminConfigSchema.parse(await readJson(request));
    const defaultInterestRate = parseMoney(
      body.defaultInterestRate,
      "defaultInterestRate",
    );

    let config = await prisma.adminConfig.findFirst();

    if (config) {
      config = await prisma.adminConfig.update({
        where: { id: config.id },
        data: {
          defaultInterestRate: defaultInterestRate.toFixed(2),
          termOptions: body.termOptions,
        },
      });
    } else {
      config = await prisma.adminConfig.create({
        data: {
          defaultInterestRate: defaultInterestRate.toFixed(2),
          termOptions: body.termOptions,
        },
      });
    }

    return NextResponse.json({
      config: {
        id: config.id,
        defaultInterestRate: config.defaultInterestRate.toFixed(2),
        termOptions: config.termOptions,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
