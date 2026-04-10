import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { EmailOtp } from "@/models/EmailOtp";

const BodySchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().regex(/^\d{5}$/, "Code must be 5 digits"),
});

/**
 * POST /api/auth/email-otp/verify
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 },
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const { code } = parsed.data;

  await connectDB();
  const record = await EmailOtp.findOne({ email }).sort({ createdAt: -1 });
  if (!record) {
    return NextResponse.json({ error: "No code found. Request a new one." }, { status: 400 });
  }
  if (record.expiresAt.getTime() < Date.now()) {
    await EmailOtp.deleteMany({ email });
    return NextResponse.json({ error: "Code expired. Resend a new code." }, { status: 400 });
  }

  const match = await bcrypt.compare(code, record.codeHash);
  if (!match) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  await EmailOtp.deleteMany({ email });
  return NextResponse.json({ ok: true });
}
