import CreateAccountForm from "@/components/home/CreateAccountForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | Jumpa",
  description: "Create a secure Jumpa account",
};

export default function Page() {
  return <CreateAccountForm />;
}
