import NotificationsSetup from "@/components/home/NotificationsSetup";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications Setup | Jumpa",
  description: "Set up notifications preferences for your Jumpa account.",
};

export default function Page() {
  return (
    <div>
      <NotificationsSetup />
    </div>
  );
}