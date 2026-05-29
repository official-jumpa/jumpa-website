import LoanNotification from "@/components/home/LoanNotification";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loan Status | Jumpa",
  description: "View loan requests",
};

export default function Page() {
  return <LoanNotification />;
}
