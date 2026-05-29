import SavingsSummary from "@/components/home/SavingsSummary";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Target Savings Summary | Jumpa",
  description: "Review and confirm your target savings goal terms and conditions.",
};

export default function Page() {
  return <SavingsSummary />;
}
