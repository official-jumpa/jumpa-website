import Send from "@/components/send/Send";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Send | Jumpa",
  description: "Send assets securely.",
};

export default function Page() {
  return <Send />;
}
