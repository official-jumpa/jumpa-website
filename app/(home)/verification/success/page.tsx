import VerificationSuccess from "@/components/home/VerificationSuccess";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verification Successful | Jumpa",
  description: "Identity verification completed",
};

export default function Page() {
  return <VerificationSuccess />;
}
