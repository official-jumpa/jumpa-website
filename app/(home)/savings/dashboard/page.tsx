import SavingsDashboard from "@/components/home/SavingsDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Savings Dashboard | Jumpa",
  description: "View interest accrued, adjust auto-saving limits, and analyze your active target savings goals",
};

export default function Page() {
  return <SavingsDashboard />;
}
