import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Wallet } from "@/models/Wallet";
import { withAuth } from "@/lib/withAuth";
import { WALLET_PIN_REGEX, WALLET_PIN_ZOD_MESSAGE } from "@/lib/wallet-pin";

const Schema = z.object({
  pin: z.string().regex(WALLET_PIN_REGEX, WALLET_PIN_ZOD_MESSAGE),
});

const PIN_MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const POST = withAuth(async (req: NextRequest, { address }) => {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  await connectDB();

  const wallet = await Wallet.findOne({ address });
  if (!wallet) {
    return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  }

  // Check lockout
  if (wallet.pinLockedUntil && wallet.pinLockedUntil > new Date()) {
    const retryAfter = Math.ceil(
      (wallet.pinLockedUntil.getTime() - Date.now()) / 1000 / 60
    );
    return NextResponse.json(
      { error: `PIN locked. Try again in ${retryAfter} minute(s)` },
      { status: 423 }
    );
  }

  const valid = await bcrypt.compare(parsed.data.pin, wallet.pinHash);

  if (!valid) {
    const attempts = wallet.pinAttempts + 1;
    const update: Record<string, unknown> = { pinAttempts: attempts };

    if (attempts >= PIN_MAX_ATTEMPTS) {
      update.pinLockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
      update.pinAttempts = 0;
    }

    await Wallet.updateOne({ address }, update);

    if (attempts >= PIN_MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "PIN locked. Try again in 15 minutes" },
        { status: 423 }
      );
    }

    return NextResponse.json(
      { error: `Incorrect PIN. ${PIN_MAX_ATTEMPTS - attempts} attempt(s) remaining` },
      { status: 401 }
    );
  }

  // Success — reset attempts
  await Wallet.updateOne({ address }, { pinAttempts: 0, pinLockedUntil: null });

  return NextResponse.json({ valid: true });
});
