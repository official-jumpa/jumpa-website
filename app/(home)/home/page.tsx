import JumpaDashboard from "@/components/home/Dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Jumpa",
  description: "View your Jumpa balance, send and receive funds, swap tokens, and manage your financial agents",
};

export default function Page() {
  return (
    <div>
      <JumpaDashboard />
    </div>
  );
}