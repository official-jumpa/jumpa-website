import Verification from "@/components/home/Verification";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Identity Verification | Jumpa",
  description: "Verify your identity (KYC) to unlock full limits",
};

export default function Page() {
  return <Verification />;
}
