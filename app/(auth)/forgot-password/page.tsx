import ForgotPasswordEmailForm from "@/components/auth/ForgotPasswordEmailForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Jumpa",
  description: "Recover your Jumpa account passcode securely by validating your email address.",
};

export default function Page() {
  return <ForgotPasswordEmailForm />;
}
