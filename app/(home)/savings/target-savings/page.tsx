import SavingsTargetSavings from "@/components/home/SavingsTargetSavings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Target Savings | Jumpa",
  description: "Monitor your active target savings goals and projections",
};

export default function Page() {
  return <SavingsTargetSavings />;
}
