import WithdrawSendMoney from "@/components/home/WithdrawSendMoney";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Withdraw Send | Jumpa",
  description: "Initiate bank wire or instant bank transfer payout from your Jumpa wallet.",
};

export default function Page() {
  return <WithdrawSendMoney />;
}
