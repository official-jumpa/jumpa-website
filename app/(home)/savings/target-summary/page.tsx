import SavingsSummary from "@/components/home/SavingsSummary";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Target Savings | Jumpa",
  description: "Review and confirm your target savings goal terms",
};

export default function Page() {
  return <SavingsSummary />;
}
