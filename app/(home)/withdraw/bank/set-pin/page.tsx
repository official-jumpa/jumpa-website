import SetPinWithdraw from "@/components/home/SetPinWithdraw";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set Transaction Pin | Jumpa",
  description: "Set up your transaction pin to authorize withdrawals",
};

export default function Page() {
  return <SetPinWithdraw />;
}
