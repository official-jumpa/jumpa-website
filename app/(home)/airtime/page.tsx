import AirtimeFlow from "@/components/home/AirtimeFlow";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Airtime | Jumpa",
  description: "Buy airtime and data",
};

export default function Page() {
  return <AirtimeFlow />;
}
