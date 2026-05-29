import PaymentSettings from "@/components/home/PaymentSettings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Settings | Jumpa",
  description: "Configure your payment pin, recovery choices, and security methods on Jumpa.",
};

export default function Page() {
  return <PaymentSettings />;
}
