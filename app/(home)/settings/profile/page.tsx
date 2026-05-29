import SettingsProfile from "@/components/home/SettingsProfile";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Jumpa",
  description: "View and configure your profile details",
};

export default function Page() {
  return <SettingsProfile />;
}
