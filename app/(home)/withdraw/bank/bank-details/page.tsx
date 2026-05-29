import WithdrawBankDetails from "@/components/home/WithdrawBankDetails";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bank Account Details | Jumpa",
  description: "Provide bank details for completing your secure fiat withdrawal.",
};

export default function Page() {
  return <WithdrawBankDetails />;
}
