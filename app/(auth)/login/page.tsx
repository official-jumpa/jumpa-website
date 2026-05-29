import LoginForm from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Jumpa",
  description: "Securely login to your Jumpa wallet and manage your funds.",
};

export default function Page() {
  return <LoginForm />;
}
