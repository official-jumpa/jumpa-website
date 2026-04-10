import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { EmailOtp } from "@/models/EmailOtp";
import { sendOtpEmail } from "@/lib/email-otp-mail";

const BodySchema = z.object({
  email: z.string().email("Invalid email address"),
});

function randomFiveDigitCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}

/**
 * POST /api/auth/email-otp/send
 * Sends a 5-digit OTP to the email (Resend if configured; else dev console).
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
  const code = randomFiveDigitCode();
  const codeHash = await bcrypt.hash(code, 8);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await connectDB();
  await EmailOtp.deleteMany({ email });

  await EmailOtp.create({ email, codeHash, expiresAt });

  try {
    await sendOtpEmail(email, code);
  } catch (e) {
    await EmailOtp.deleteMany({ email });
    const msg = e instanceof Error ? e.message : "Failed to send email";
    console.error("[email-otp/send]", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  return NextResponse.json({ ok: true, expiresInSeconds: 600 });
}
