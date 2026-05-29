import VerificationFailed from "@/components/home/VerificationFailed";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verification Failed | Jumpa",
  description: "Identity verification failed. Please check your credentials and retry.",
};

export default function Page() {
  return <VerificationFailed />;
}
