import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { SwitchService } from "@/lib/switch";
import { Wallet } from "@/models/Wallet";
import { Transaction } from "@/models/Transaction";
import RampTransaction from "@/models/RampTransaction";
import { connectDB } from "@/lib/db";

export const POST = withAuth(async (req, { address }) => {
  try {
    const { amount, asset, exact_output = false } = await req.json();

    if (!amount || !asset) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    const wallet = await Wallet.findOne({ address: address.toLowerCase() });
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    // Determine the right wallet address based on the requested on-ramp asset
    const isSolana = asset.startsWith("solana:");
    const targetAddress = isSolana ? wallet.addresses.sol : wallet.addresses.base;

    if (!targetAddress) {
      return NextResponse.json({ error: "No wallet address found for this chain" }, { status: 400 });
    }

    const onRampRes = await SwitchService.initiateOnRamp(Number(amount), asset, targetAddress, exact_output);

    if (onRampRes.success && onRampRes.data) {
      // Log to our new RampTransaction ledger
      await RampTransaction.create({
        userId: wallet.id,
        type: "ONRAMP",
        status: "AWAITING_DEPOSIT",
        reference: onRampRes.data.reference,
        asset,
        amount: onRampRes.data.destination.amount,
        fiat_currency: "NGN", // Currently only NGN supported
        fiat_amount: Number(amount), // In onramp, 'amount' is usually in fiat if exact_output is false
        deposit_address: targetAddress
      });

      // Also create a pending transaction record for the legacy ledger
      await Transaction.create({
        userId: wallet.id,
        fromAddress: "FIAT",
        toAddress: targetAddress,
        amount: String(onRampRes.data.destination.amount),
        token: onRampRes.data.destination.currency,
        hash: onRampRes.data.reference, // Use switch reference as tracking hash
        chain: isSolana ? "solana" : "base",
        status: "pending",
      });

      return NextResponse.json(onRampRes);
    } else {
      return NextResponse.json({ error: onRampRes.message }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to initiate onramp" }, { status: 500 });
  }
});
