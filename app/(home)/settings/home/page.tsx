import SettingsHome from "@/components/home/SettingsHome";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings Home | Jumpa",
  description: "View and configure your main Jumpa wallet settings.",
};

export default function Page() {
  return <SettingsHome />;
}
