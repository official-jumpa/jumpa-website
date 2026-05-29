import WithdrawCryptoAsset from "@/components/home/WithdrawCryptoAsset";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Withdraw Crypto | Jumpa",
  description: "Provide destination address and complete your cryptocurrency transfer.",
};

export default function Page() {
  return <WithdrawCryptoAsset />;
}
