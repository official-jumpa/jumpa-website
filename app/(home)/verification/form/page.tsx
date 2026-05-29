import VerifyAccountForm from "@/components/home/VerifyAccountForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Account Form | Jumpa",
  description: "Fill in your details to verify your Jumpa wallet",
};

export default function Page() {
  return <VerifyAccountForm />;
}
