import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { SwitchUserBankDetails } from "@/lib/SwitchUserBankDetails";

export const POST = withAuth(async (req) => {
  try {
    const { accountNumber, bankCode } = await req.json();
    if (!accountNumber || !bankCode) {
      return NextResponse.json({ error: "Missing accountNumber or bankCode" }, { status: 400 });
    }

    const result = await SwitchUserBankDetails(bankCode, accountNumber);
    if (result && result.success === true && result.data?.account_name) {
      return NextResponse.json({
        success: true,
        accountName: result.data.account_name
      });
    }

    return NextResponse.json({
      success: false,
      error: result?.message || "Failed to resolve account number"
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
});
