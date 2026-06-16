import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { SwitchService } from "@/lib/switch";

export const POST = withAuth(async (req, { address }) => {
  try {
    const { amount, asset, exact_output = false } = await req.json();

    console.log(`[Onramp Quote API] Fetching quote - amount: ${amount}, asset: ${asset}, exactOutput: ${exact_output}`);

    if (!amount || !asset) {
      console.warn("[Onramp Quote API] Missing required parameters (amount or asset)");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const quoteRes = await SwitchService.getQuote(Number(amount), asset, exact_output);

    if (quoteRes.success) {
      console.log(`[Onramp Quote API] Successfully fetched quote. Rate: ${quoteRes.data?.rate}`);
      return NextResponse.json(quoteRes);
    } else {
      console.warn("[Onramp Quote API] Switch quote call returned error status:", quoteRes.message);
      return NextResponse.json({ error: quoteRes.message }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[Onramp Quote API Error]", error);
    return NextResponse.json({ error: error.message || "Failed to fetch quote" }, { status: 500 });
  }
});
