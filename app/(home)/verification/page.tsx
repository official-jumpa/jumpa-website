import Verification from "@/components/home/Verification";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Identity Verification | Jumpa",
  description: "Verify your identity (KYC) to unlock full limits and trade/send limits on Jumpa.",
};

export default function Page() {
  return <Verification />;
}
