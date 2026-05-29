import ForgotPasswordVerificationForm from "@/components/auth/ForgotPasswordVerificationForm";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Verify Verification Code | Jumpa",
  description: "Verify the passcode recovery verification code sent to your email.",
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordVerificationForm />
    </Suspense>
  );
}
