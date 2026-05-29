import SavingsTargetForm from "@/components/home/SavingsTargetForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Target Savings | Jumpa",
  description: "Set up a new target savings portfolio with flexible deposit frequencies",
};

export default function Page() {
  return <SavingsTargetForm />;
}
