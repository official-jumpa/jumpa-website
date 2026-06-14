import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { connectDB } from "@/lib/db";
import { Wallet } from "@/models/Wallet";
import { Transaction } from "@/models/Transaction";

/**
 * GET /api/wallet/transactions
 * Fetch transaction history for the currently selected wallet
 */
export const GET = withAuth(async (req, { address }) => {
  try {
    await connectDB();

    // Locate the wallet by address
    const wallet = await Wallet.findOne({ address: address.toLowerCase() });
    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Fetch all transaction records matching the wallet's database ID
    const transactions = await Transaction.find({ userId: wallet._id })
      .sort({ createdAt: -1 })
      .limit(30);

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
});
