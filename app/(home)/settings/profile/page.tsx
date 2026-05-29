import SettingsProfile from "@/components/home/SettingsProfile";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Settings | Jumpa",
  description: "View and configure your Jumpa wallet user profile details.",
};

export default function Page() {
  return <SettingsProfile />;
}
