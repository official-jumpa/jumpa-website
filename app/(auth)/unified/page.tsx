import LoginForm from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unified Access | Jumpa",
  description: "Access your Jumpa wallet securely.",
};

export default function Page() {
  return <LoginForm />;
}
