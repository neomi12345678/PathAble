"use client";

import { useEffect, useState } from "react";
import type { ChatMessage } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CHAT_SHORTCUTS } from "@/lib/mock/chat";
import { getMockChatMessages, sendMockChatMessage } from "@/lib/mock/api";

const LOADING_TEXT = "טוען צאט...";
const LOAD_ERROR = "אירעה שגיאה בטעינת הצאט";
const TYPING_TEXT = "היועץ מקליד...";

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMockChatMessages()
      .then(setMessages)
      .catch(() => setError(LOAD_ERROR))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSend = async (text: string): Promise<void> => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      session_id: "demo-session-001",
      role: "user",
      message: text.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const response = await sendMockChatMessage(text.trim());
      setMessages((prev) => [...prev, response]);
    } catch {
      setError("אירעה שגיאה, נסה שוב");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <p className="text-muted">{LOADING_TEXT}</p>;
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4 flex flex-wrap gap-2">
        {CHAT_SHORTCUTS.map((shortcut) => (
          <Button
            key={shortcut}
            variant="outline"
            onClick={() => handleSend(shortcut)}
            disabled={isSending}
          >
            {shortcut}
          </Button>
        ))}
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-3 overflow-y-auto p-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-white"
                    : "bg-background text-text-main"
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))}
          {isSending && (
            <p className="text-sm text-muted">{TYPING_TEXT}</p>
          )}
        </div>

        {error && (
          <div className="border-t border-border p-2">
            <p className="text-sm text-red-600">{error}</p>
            <Button
              variant="outline"
              className="mt-1"
              onClick={() => setError(null)}
            >
              נסה שוב
            </Button>
          </div>
        )}

        <form
          className="flex gap-2 border-t border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="כתוב הודעה..."
            className="flex-1 rounded-xl border border-border px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary"
            disabled={isSending}
          />
          <Button type="submit" disabled={isSending}>
            שלח
          </Button>
        </form>
      </Card>
    </div>
  );
}
