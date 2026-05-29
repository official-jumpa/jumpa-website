import Landing from "@/components/landing/Landing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jumpa Wallet | Chat Trading, Saving & AI Financial Agents",
  description: "Jumpa is a secure wallet that lets you trade in chats, pool funds, and save with smart AI financial agents.",
};

export default function Home() {
  return (
    <main>
      <Landing />
    </main>
  );
}
