import Investment from "@/components/home/Investment";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investment | Jumpa",
  description: "Invest your funds in stable high-yield options managed by Jumpa AI agents",
};

export default function Page() {
  return <Investment />;
}
