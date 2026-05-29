import Savings from "@/components/home/Savings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Savings | Jumpa",
  description: "View options, set targets, and manage your automated smart savings portfolios on Jumpa.",
};

export default function Page() {
  return <Savings />;
}
