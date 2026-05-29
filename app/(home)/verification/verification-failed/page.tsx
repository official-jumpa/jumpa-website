import VerificationFailedForm from "@/components/home/VerificationFailedForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verification Retry | Jumpa",
  description: "Identity verification failed. Complete the retry form to submit corrections.",
};

export default function Page() {
  return <VerificationFailedForm />;
}
