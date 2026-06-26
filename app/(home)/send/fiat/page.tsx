import SendFiatPage from "@/features/send-fiat/send-fiat-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Send Fiat | Jumpa",
  description: "Send fiat via bank transfer.",
};

export default function Page() {
  return <SendFiatPage />;
}
