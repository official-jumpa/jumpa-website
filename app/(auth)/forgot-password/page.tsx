import ForgotPasswordEmailForm from "@/components/auth/ForgotPasswordEmailForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Jumpa",
  description: "Recover your Jumpa account",
};

export default function Page() {
  return <ForgotPasswordEmailForm />;
}
