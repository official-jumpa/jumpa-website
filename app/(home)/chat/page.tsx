import AiChat from "@/components/chat/AiChat";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Chat Assistant | Jumpa",
  description: "Chat with the Jumpa AI financial agent",
};

export default function Page() {
  return (
    <div>
      <AiChat />
    </div>
  );
}
