import LoanNotification from "@/components/home/LoanNotification";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loan Status | Jumpa",
  description: "View updates and notifications related to your active loan requests on Jumpa.",
};

export default function Page() {
  return <LoanNotification />;
}
