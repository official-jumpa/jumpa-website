import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { SwitchService } from "@/lib/switch";

export const POST = withAuth(async (req, { address }) => {
  try {
    const { amount, asset, exact_output = false } = await req.json();

    if (!amount || !asset) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const quoteRes = await SwitchService.getQuote(Number(amount), asset, exact_output);

    if (quoteRes.success) {
      return NextResponse.json(quoteRes);
    } else {
      return NextResponse.json({ error: quoteRes.message }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch quote" }, { status: 500 });
  }
});
