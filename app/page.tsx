import Landing from "@/components/landing/Landing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jumpa Wallet",
  description: "Jumpa is a secure wallet that lets you trade in chats, pool funds, and save",
};

export default function Home() {
  return (
    <main>
      <Landing />
    </main>
  );
}
