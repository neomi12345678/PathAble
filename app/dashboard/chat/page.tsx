import { ChatInterface } from "@/components/chat/ChatInterface";

const CHAT_SUBTITLE = "שוחח עם יועץ הקריירה שלך";

export default function ChatPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">יועץ קריירה AI</h2>
        <p className="text-muted">{CHAT_SUBTITLE}</p>
      </div>
      <ChatInterface />
    </div>
  );
}
