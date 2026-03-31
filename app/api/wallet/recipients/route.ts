import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { Transaction as TransactionModel } from "@/models/Transaction";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";

/**
 * GET /api/wallet/recipients
 * Returns the last 5 unique recipients the user has sent funds to.
 */
export const GET = withAuth(async (req, { address }) => {
  try {
    await connectDB();
    const { Wallet } = await import("@/models/Wallet");
    const wallet = await Wallet.findOne({ address });
    
    if (!wallet) {
      return NextResponse.json({ recipients: [] });
    }

    const ROUTER_ADDRESS = "0xeD53235cC3E9d2d464E9c408B95948836648870B";
    const WFLOW_ADDRESS = "0xd3bF53DAC106A0290B0483EcBC89d40FcC961f3e";

    const recipients = await TransactionModel.aggregate([
      { $match: { 
          userId: wallet._id,
          toAddress: { $nin: [ROUTER_ADDRESS, WFLOW_ADDRESS] }
      } },
      { $sort: { createdAt: -1 } },
      { $group: { 
          _id: "$toAddress", 
          lastUsed: { $first: "$createdAt" },
          token: { $first: "$token" }
      } },
      { $sort: { lastUsed: -1 } },
      { $limit: 5 },
      { $project: {
          _id: 0,
          address: "$_id",
          lastUsed: 1,
          token: 1
      }}
    ]);

    return NextResponse.json({ recipients });

  } catch (err: any) {
    console.error("[Recipients Error]", err);
    return NextResponse.json({ recipients: [] });
  }
});
