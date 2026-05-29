import LoanDashboard from "@/components/home/LoanDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loan Dashboard | Jumpa",
  description: "View interest rates, calculate payments, and manage your credit score",
};

export default function Page() {
  return <LoanDashboard />;
}
