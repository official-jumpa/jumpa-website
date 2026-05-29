import WithdrawOptions from "@/components/home/WithdrawOptions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Withdrawal Options | Jumpa",
  description: "Select your preferred withdrawal method: bank account or wallet.",
};

export default function Page() {
  return <WithdrawOptions />;
}
