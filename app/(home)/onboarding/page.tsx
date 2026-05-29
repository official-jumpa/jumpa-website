import Onboarding from "@/components/onboarding/Onboarding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding | Jumpa",
  description: "Welcome to Jumpa. Get started with chat trading, joint savings, and smart agents.",
};

export default function Page() {
  return <Onboarding />;
}
