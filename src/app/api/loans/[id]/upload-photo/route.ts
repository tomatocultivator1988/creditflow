import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const supabaseUrl = process.env.SUPABASE_STORAGE_URL!;
const supabaseKey = process.env.SUPABASE_STORAGE_KEY!;

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;

    const existing = await prisma.loanAccount.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Loan account not found");

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${id}-${Date.now()}.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Use direct fetch to avoid supabase-js auth header issue with sb_secret_ keys
    const uploadUrl = `${supabaseUrl}/storage/v1/object/profile-pics/${fileName}`;
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        "Content-Type": file.type,
      },
      body: buffer,
    });

    if (!uploadRes.ok) {
      const errBody = await uploadRes.text();
      return NextResponse.json(
        { error: `Upload failed: ${errBody}` },
        { status: 500 },
      );
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/profile-pics/${fileName}`;

    const updated = await prisma.loanAccount.update({
      where: { id },
      data: { profilePicUrl: publicUrl },
    });

    return NextResponse.json({ profilePicUrl: updated.profilePicUrl });
  } catch (error) {
    return handleApiError(error);
  }
}
