import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { SwitchService } from "@/lib/switch";
import RampTransaction from "@/models/RampTransaction";
import { connectDB } from "@/lib/db";

export const GET = withAuth(async (req: NextRequest, { address }) => {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Missing reference parameter" }, { status: 400 });
    }

    console.log(`[Status API] Querying status for reference: ${reference}`);

    await connectDB();

    const switchRes = await SwitchService.getTransactionStatus(reference);

    if (!switchRes.success || !switchRes.data) {
      return NextResponse.json({ error: switchRes.message || "Failed to fetch status from Switch" }, { status: 400 });
    }

    const { status, hash, explorer_url } = switchRes.data;

    // Find and update RampTransaction
    const rampTx = await RampTransaction.findOne({ reference });
    if (rampTx && rampTx.status !== status) {
      console.log(`[Status API] Transitioning RampTransaction ${reference} status from ${rampTx.status} to ${status}`);
      rampTx.status = status;
      if (hash) rampTx.tx_hash = hash;
      await rampTx.save();
    }

    return NextResponse.json({
      success: true,
      status,
      hash,
      explorer_url,
      data: switchRes.data
    });

  } catch (error: any) {
    console.error("[Status API Error]", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve transaction status" }, { status: 500 });
  }
});
