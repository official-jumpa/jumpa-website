import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Wallet } from "@/models/Wallet";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const wallets = await Wallet.find({ userId: session.user.id }, "address name createdAt");

  // Read selected cookie
  const selectedAddress = req.cookies.get("selected_wallet_address")?.value;

  // Map to include an isSelected flag
  const result = wallets.map((w, index) => ({
    address: w.address,
    name: w.name || `Wallet ${index + 1}`,
    createdAt: w.createdAt,
    isSelected: selectedAddress
      ? w.address.toLowerCase() === selectedAddress.toLowerCase()
      : index === 0, // default to first wallet if no cookie set
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { address, name: newName } = body as { address?: string; name?: string };

  if (!address || !newName || !newName.trim()) {
    return NextResponse.json({ error: "Address and new name are required" }, { status: 400 });
  }

  const trimmedName = newName.trim();

  await connectDB();

  // Find wallet owned by user
  const wallet = await Wallet.findOne({ userId: session.user.id, address: address.toLowerCase() });
  if (!wallet) {
    return NextResponse.json({ error: "Wallet not found or not owned by user" }, { status: 404 });
  }

  // Enforce name uniqueness case-insensitively for this user
  const duplicate = await Wallet.findOne({
    userId: session.user.id,
    name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
    address: { $ne: address.toLowerCase() },
  });

  if (duplicate) {
    return NextResponse.json({ error: "A wallet with this name already exists" }, { status: 400 });
  }

  // Update name
  wallet.name = trimmedName;
  await wallet.save();

  return NextResponse.json({ message: "Wallet renamed successfully", name: wallet.name });
}
