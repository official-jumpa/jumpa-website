import AirtimeFlow from "@/components/home/AirtimeFlow";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buy Airtime | Jumpa",
  description: "Recharge your mobile phone or buy airtime and data easily with Jumpa.",
};

export default function Page() {
  return <AirtimeFlow />;
}
