import SelectCryptoAsset from "@/components/home/SelectCryptoAsset";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Select Crypto Asset | Jumpa",
  description: "Choose from stablecoins or other major cryptocurrencies to withdraw from your wallet.",
};

export default function Page() {
  return <SelectCryptoAsset />;
}
