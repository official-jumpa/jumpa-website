import VerificationSuccess from "@/components/home/VerificationSuccess";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verification Successful | Jumpa",
  description: "Identity verification successfully completed. Your account limits are now updated.",
};

export default function Page() {
  return <VerificationSuccess />;
}
