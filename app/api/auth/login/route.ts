import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Wallet } from "@/models/Wallet";
import { createSession } from "@/lib/session";

const BodySchema = z.object({
  address: z.string().min(1, "Wallet address is required"),
  password: z.string().min(1, "Password is required"),
});

/**
 * POST /api/auth/login
 * Verifies the wallet password and issues a JWT session cookie.
 * The address is the primary ETH public key stored in localStorage.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { address, password } = parsed.data;

  await connectDB();

  const wallet = await Wallet.findOne({ address: address.toLowerCase() });
  if (!wallet) {
    return NextResponse.json(
      { error: "Invalid address or password" },
      { status: 401 }
    );
  }

  const passwordValid = await bcrypt.compare(password, wallet.passwordHash);
  if (!passwordValid) {
    return NextResponse.json(
      { error: "Invalid address or password" },
      { status: 401 }
    );
  }

  await createSession({ address: wallet.address });

  return NextResponse.json({
    message: "Login successful",
    address: wallet.address,
    addresses: wallet.addresses,
  });
}
