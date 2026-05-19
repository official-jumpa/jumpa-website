import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Wallet } from "@/models/Wallet";
import { Transaction } from "@/models/Transaction";

/**
 * GET /api/wallet/transactions
 * Fetch on-chain transaction history for the authenticated user session.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // 1. Locate the active wallet
    const wallet = await Wallet.findOne({ userId: session.user.id });
    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // 2. Fetch all transaction records matching the wallet's database ID
    const transactions = await Transaction.find({ userId: wallet._id })
      .sort({ createdAt: -1 })
      .limit(30);
    console.log("transaction response", transactions);

    return NextResponse.json({
      success: true,
      addresses: wallet.addresses,
      transactions,
    });
  } catch (err: any) {
    console.error("[Transactions GET Error]", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
