import NotificationsSetup from "@/components/home/NotificationsSetup";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications Setup | Jumpa",
  description: "Configure your notifications preferences",
};

export default function Page() {
  return <NotificationsSetup />;
}