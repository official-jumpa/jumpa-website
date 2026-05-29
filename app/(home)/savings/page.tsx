import Savings from "@/components/home/Savings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Savings | Jumpa",
  description: "View savings options, set targets, and manage automated smart savings portfolios",
};

export default function Page() {
  return <Savings />;
}
