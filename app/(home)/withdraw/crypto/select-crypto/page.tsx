import SelectCryptoAsset from "@/components/home/SelectCryptoAsset";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Select Crypto Asset | Jumpa",
  description: "Choose from major cryptocurrencies to withdraw",
};

export default function Page() {
  return <SelectCryptoAsset />;
}
