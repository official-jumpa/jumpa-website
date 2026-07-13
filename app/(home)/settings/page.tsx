import SettingsDashboard from "@/components/home/SettingsDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Jumpa",
  description: "Configure your Jumpa account",
};

export default function Page() {
  return <SettingsDashboard />;
}
