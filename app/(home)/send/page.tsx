import Send from "@/components/send/Send";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Send Funds | Jumpa",
  description: "Send funds and digital assets to friends, family, or other wallets securely.",
};

export default function Page() {
  return <Send />;
}
