import InvestmentHome from "@/components/home/InvestmentHome";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invest | Jumpa",
  description: "Invest your funds in stable high-yield options",
};

export default function Page() {
  return <InvestmentHome />;
}
