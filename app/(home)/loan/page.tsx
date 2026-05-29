import Loan from "@/components/home/Loan";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loans | Jumpa",
  description: "Borrow funds, view rates, and manage active loans",
};

export default function Page() {
  return <Loan />;
}
