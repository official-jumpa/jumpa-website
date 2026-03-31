import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Wallet } from "@/models/Wallet";

export async function GET() {
  try {
    const conn = await connectDB();

    const indexes = await Wallet.listIndexes();

    return NextResponse.json({
      status: "ok",
      db: conn.name,
      host: conn.host,
      walletIndexes: indexes.map((i) => i.key),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
