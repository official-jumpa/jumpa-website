import Onboarding from "@/components/onboarding/Onboarding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding | Jumpa",
  description: "Onboarding",
};

export default function Page() {
  return <Onboarding />;
}
