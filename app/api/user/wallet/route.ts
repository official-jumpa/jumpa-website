import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Wallet } from "@/models/Wallet";

/** GET /api/auth/me — returns the current session wallet info */
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  
  // Find wallet by BetterAuth user ID
  const wallet = await Wallet.findOne(
    { userId: session.user.id }, 
    "address addresses publicKeys createdAt"
  );

  if (!wallet) {
    return NextResponse.json({ error: "Wallet not found for this user" }, { status: 404 });
  }

  return NextResponse.json({
    address: wallet.address,
    addresses: wallet.addresses,
    publicKeys: wallet.publicKeys,
    createdAt: wallet.createdAt,
  });
}
