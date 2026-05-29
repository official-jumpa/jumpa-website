import SavingsNotification from "@/components/home/SavingsNotification";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Savings Notifications | Jumpa",
  description: "View updates related to your active target savings and investment portfolios.",
};

export default function Page() {
  return <SavingsNotification />;
}
