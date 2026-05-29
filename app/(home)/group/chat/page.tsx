import GroupAiChat from "@/components/chat/GroupAiChat";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Group Chat | Jumpa",
  description: "Chat and collaborate with your group members using Jumpa AI",
};

export default function GroupChatPage() {
  return (
    <div>
      <GroupAiChat />
    </div>
  );
}
