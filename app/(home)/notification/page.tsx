import DriverNotification from "@/components/home/DriverNotification";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | Jumpa",
  description: "View all your notifications and transaction updates on Jumpa.",
};

export default function Page() {
  return <DriverNotification />;
}
