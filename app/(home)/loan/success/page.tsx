import LoanRequestSuccess from "@/components/home/LoanRequestSuccess";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loan Successful | Jumpa",
  description: "Loan successful",
};

export default function Page() {
  return <LoanRequestSuccess />;
}
