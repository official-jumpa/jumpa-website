import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { SwitchService } from "@/lib/switch";
import { Wallet } from "@/models/Wallet";
import RampTransaction from "@/models/RampTransaction";
import { connectDB } from "@/lib/db";

export const POST = withAuth(async (req, { address }) => {
  try {
    const { amount, asset, exact_output = false } = await req.json();

    console.log(`[Onramp Initiate API] Request received - user: ${address}, amount: ${amount}, asset: ${asset}, exactOutput: ${exact_output}`);

    if (!amount || !asset) {
      console.warn("[Onramp Initiate API] Missing required parameters (amount or asset)");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    const wallet = await Wallet.findOne({ address: address.toLowerCase() });
    if (!wallet) {
      console.warn(`[Onramp Initiate API] Wallet not found for address: ${address}`);
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Determine the right wallet address based on the requested on-ramp asset
    const isSolana = asset.startsWith("solana:");
    const targetAddress = isSolana ? wallet.addresses.sol : wallet.addresses.base;
    console.log(`[Onramp Initiate API] Target wallet resolved to: ${targetAddress} (chain: ${isSolana ? "solana" : "base"})`);

    if (!targetAddress) {
      console.warn(`[Onramp Initiate API] No wallet address mapped for chain of asset: ${asset}`);
      return NextResponse.json({ error: "No wallet address found for this chain" }, { status: 400 });
    }

    const onRampRes = await SwitchService.initiateOnRamp(Number(amount), asset, targetAddress, exact_output);

    if (onRampRes.success && onRampRes.data) {
      console.log(`[Initiate Onramp] Creating RampTransaction. Reference: ${onRampRes.data.reference}. `);

      // Determine the actual Naira fiat amount to log in the ledger.
      // - exact_output=false: user specified fiat in NGN, so `amount` IS the fiat value.
      // - exact_output=true:  user specified a stablecoin quantity (e.g. 30 USDC), so
      //   the Naira fiat is what Switch returns in source.amount (the required payment).
      //   Fall back to amount * rate if source.amount is not in the response.
      let fiatAmountToLog: number;
      if (exact_output) {
        const sourceAmount = (onRampRes.data as any).source?.amount;
        const rate = (onRampRes.data as any).rate;
        if (sourceAmount) {
          fiatAmountToLog = Number(sourceAmount);
          console.log(`[Onramp Initiate API] exact_output=true: using source.amount (${fiatAmountToLog} NGN) from Switch response.`);
        } else if (rate) {
          fiatAmountToLog = Number(amount) * Number(rate);
          console.log(`[Onramp Initiate API] exact_output=true: source.amount missing, computed fiat via rate fallback: ${fiatAmountToLog} NGN.`);
        } else {
          fiatAmountToLog = 0;
          console.warn("[Onramp Initiate API] exact_output=true: could not determine fiat amount — no source.amount or rate in response.");
        }
      } else {
        fiatAmountToLog = Number(amount);
        console.log(`[Onramp Initiate API] exact_output=false: fiat amount = ${fiatAmountToLog} NGN.`);
      }

      // Log to our RampTransaction ledger
      await RampTransaction.create({
        userId: wallet.id,
        type: "ONRAMP",
        status: "AWAITING_DEPOSIT",
        reference: onRampRes.data.reference,
        asset,
        amount: onRampRes.data.destination.amount,   // stablecoin amount to be received
        fiat_currency: "NGN",
        fiat_amount: fiatAmountToLog,                // actual Naira amount the user must pay
        deposit_address: targetAddress
      });

      console.log(`[Initiate Onramp] reference: ${onRampRes.data.reference} | fiat_amount: ${fiatAmountToLog} NGN | crypto: ${onRampRes.data.destination.amount} ${onRampRes.data.destination.currency}`);


      /**
       * sync the transaction status of all pending transactions on the platform
       * Its a fire and forget call, so it doesnt slow down any user's query
       */
      fetch(`${req.nextUrl.origin}/api/wallet/transactions/status`).catch(() => { });

      return NextResponse.json(onRampRes);
    } else {
      console.error("[Onramp Initiate API] Switch call failed:", onRampRes.message);
      return NextResponse.json({ error: onRampRes.message }, { status: 400 });
    }

  } catch (error: any) {
    console.error("[Onramp Initiate API Error]", error);
    return NextResponse.json({ error: error.message || "Failed to initiate onramp" }, { status: 500 });
  }
});
