import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Wallet } from "@/models/Wallet";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { address } = body as { address?: string };

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  await connectDB();

  // Verify ownership
  const wallet = await Wallet.findOne({ userId: session.user.id, address: address.toLowerCase() });
  if (!wallet) {
    return NextResponse.json({ error: "Wallet not found or not owned by user" }, { status: 404 });
  }

  const response = NextResponse.json({ message: "Wallet selected", address: wallet.address });

  response.cookies.set("selected_wallet_address", wallet.address, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return response;
}
