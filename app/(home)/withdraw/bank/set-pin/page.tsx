import SetPinWithdraw from "@/components/home/SetPinWithdraw";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set Transaction Pin | Jumpa",
  description: "Set or confirm your transaction pin to authorize withdrawals on Jumpa.",
};

export default function Page() {
  return <SetPinWithdraw />;
}
