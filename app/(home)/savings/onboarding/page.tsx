import SavingsOnboarding from "@/components/home/SavingsOnboarding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start Saving | Jumpa",
  description: "Learn how Jumpa AI savings agent will invest and secure your assets dynamically.",
};

export default function Page() {
  return <SavingsOnboarding />;
}
