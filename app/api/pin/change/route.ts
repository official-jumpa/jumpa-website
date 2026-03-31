import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Wallet } from "@/models/Wallet";
import { withAuth } from "@/lib/withAuth";

const Schema = z.object({
  currentPin: z.string().regex(/^\d{4}$/, "Current PIN must be exactly 4 digits"),
  newPin: z.string().regex(/^\d{4}$/, "New PIN must be exactly 4 digits"),
});

export const POST = withAuth(async (req: NextRequest, { address }) => {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { currentPin, newPin } = parsed.data;

  if (currentPin === newPin) {
    return NextResponse.json(
      { error: "New PIN must be different from current PIN" },
      { status: 400 }
    );
  }

  await connectDB();

  const wallet = await Wallet.findOne({ address });
  if (!wallet) {
    return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  }

  // Check lockout before verifying currentPin
  if (wallet.pinLockedUntil && wallet.pinLockedUntil > new Date()) {
    return NextResponse.json(
      { error: "PIN locked. Try again later" },
      { status: 423 }
    );
  }

  const valid = await bcrypt.compare(currentPin, wallet.pinHash);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect current PIN" }, { status: 401 });
  }

  const newPinHash = await bcrypt.hash(newPin, 10);
  await Wallet.updateOne(
    { address },
    { pinHash: newPinHash, pinAttempts: 0, pinLockedUntil: null }
  );

  return NextResponse.json({ message: "PIN updated successfully" });
});
