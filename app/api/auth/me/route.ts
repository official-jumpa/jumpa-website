import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { Wallet } from "@/models/Wallet";

/** GET /api/auth/me — returns the current session wallet info */
export async function GET(req: NextRequest) {
  const session = await getSession(req);

  if (!session?.address) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const wallet = await Wallet.findOne({ address: session.address }, "address addresses publicKeys createdAt");

  if (!wallet) {
    return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  }

  return NextResponse.json({
    address: wallet.address,
    addresses: wallet.addresses,
    publicKeys: wallet.publicKeys,
    createdAt: wallet.createdAt,
  });
}
