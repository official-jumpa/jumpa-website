import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { connectDB } from "@/lib/db";
import { Wallet } from "@/models/Wallet";
import { Transaction } from "@/models/Transaction";
import RampTransaction from "@/models/RampTransaction";

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

    // Get all wallet addresses across chains to find incoming transfers
    const userAddresses = wallet.addresses ? Object.values(wallet.addresses).map((addr: any) => addr.toLowerCase()) : [];
    if (wallet.address) userAddresses.push(wallet.address.toLowerCase());

    // Create an array of case-insensitive regexes for matching addresses
    const addressRegexes = userAddresses.map(addr => new RegExp(`^${addr}$`, 'i'));

    // 1. Fetch Crypto Transactions
    const cryptoTxDocs = await Transaction.find({
      $or: [
        { userId: wallet.userId },
        { userId: wallet._id }, // Support legacy records
        { toAddress: { $in: addressRegexes } }
      ]
    }).lean();

    // 2. Fetch Ramp Transactions
    const rampTxDocs = await RampTransaction.find({
      $or: [
        { userId: wallet.userId },
        { userId: wallet._id.toString() } // Support legacy records
      ]
    }).lean();

    // 3. Map to unified format
    const formattedCrypto = cryptoTxDocs.map((doc: any) => ({
      _id: doc._id.toString(),
      recordType: "transfer",
      fromAddress: doc.fromAddress,
      toAddress: doc.toAddress,
      amount: doc.amount,
      token: doc.token,
      hash: doc.hash,
      status: doc.status,
      chain: doc.chain,
      createdAt: doc.createdAt,
    }));

    const formattedRamps = rampTxDocs.map((doc: any) => ({
      _id: doc._id.toString(),
      recordType: doc.type === "ONRAMP" ? "onramp" : "offramp",
      amount: doc.amount,
      token: doc.asset,
      status: doc.status,
      createdAt: doc.createdAt,
      fiatAmount: doc.fiat_amount,
      fiatCurrency: doc.fiat_currency,
      bankDetails: doc.bank_details,
      reference: doc.reference,
      txHash: doc.tx_hash,
    }));

    // 4. Combine and Sort
    const allTransactions = [...formattedCrypto, ...formattedRamps].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    const limitedTransactions = allTransactions.slice(0, 50);

    return NextResponse.json({
      success: true,
      addresses: wallet.addresses,
      transactions: limitedTransactions,
    });
  } catch (err: any) {
    console.error("[Transactions GET Error]", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
});
