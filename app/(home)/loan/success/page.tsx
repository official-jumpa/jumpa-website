import LoanRequestSuccess from "@/components/home/LoanRequestSuccess";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loan Successful | Jumpa",
  description: "Your loan request has been successfully processed and disbursed.",
};

export default function Page() {
  return <LoanRequestSuccess />;
}
