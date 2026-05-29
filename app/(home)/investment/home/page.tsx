import InvestmentHome from "@/components/home/InvestmentHome";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investment Platform | Jumpa",
  description: "Access high-performing automated portfolios powered by AI trading systems.",
};

export default function Page() {
  return <InvestmentHome />;
}
