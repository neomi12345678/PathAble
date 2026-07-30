import type { Metadata } from "next";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { CHAT } from "@/utils/texts";

export const metadata: Metadata = {
  title: `${CHAT.title} | עתיד מתאים`,
  description: CHAT.subtitle,
};

export default function ChatPage() {
  return <ChatInterface />;
}
