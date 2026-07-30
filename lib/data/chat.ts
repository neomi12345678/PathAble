import { createClient } from "@/lib/supabase/server";
import { getOpenAIClient } from "@/lib/openai";
import { CHAT_ADVISOR_PROMPT } from "@/lib/prompts";
import type { ChatMessage } from "@/types";
import { getProfileByUserId } from "./profile";

async function getOrCreateSession(userId: string): Promise<string> {
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Session create failed");
  return data.id;
}

export async function getChatMessagesFromDb(
  userId: string
): Promise<ChatMessage[]> {
  const supabase = createClient();
  const sessionId = await getOrCreateSession(userId);
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at");
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    session_id: row.session_id,
    role: row.role as ChatMessage["role"],
    message: row.message,
    created_at: row.created_at,
  }));
}

export async function sendChatMessageFromDb(
  userId: string,
  message: string
): Promise<ChatMessage> {
  const supabase = createClient();
  const sessionId = await getOrCreateSession(userId);

  await supabase.from("chat_messages").insert({
    session_id: sessionId,
    role: "user",
    message,
  });

  const profile = await getProfileByUserId(userId);
  const { data: resultRow } = await supabase
    .from("assessment_results")
    .select("summary, strengths, recommendations")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const systemPrompt = CHAT_ADVISOR_PROMPT.replace(
    "{first_name}",
    profile?.first_name ?? "משתמש"
  )
    .replace("{sector}", profile?.sector ?? "לא צוין")
    .replace("{disability_type}", profile?.disability_type ?? "לא צוין")
    .replace("{assessment_summary}", resultRow?.summary ?? "טרם בוצע אבחון")
    .replace("{strengths}", (resultRow?.strengths ?? []).join(", ") || "—")
    .replace(
      "{recommendations}",
      (resultRow?.recommendations ?? []).join(", ") || "—"
    );

  const openai = getOpenAIClient();
  const chatUnavailableMessage =
    "היועץ החכם אינו זמין כרגע. נסו שוב מאוחר יותר או פנו לתמיכה דרך עמוד הזכויות.";

  let assistantText: string;

  if (openai) {
    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, message")
      .eq("session_id", sessionId)
      .order("created_at")
      .limit(20);

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...(history ?? []).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.message,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
    });
    assistantText =
      completion.choices[0]?.message?.content?.trim() ?? chatUnavailableMessage;
  } else {
    assistantText = chatUnavailableMessage;
  }

  const { data: inserted, error } = await supabase
    .from("chat_messages")
    .insert({
      session_id: sessionId,
      role: "assistant",
      message: assistantText,
    })
    .select("*")
    .single();

  if (error || !inserted) {
    throw new Error(error?.message ?? "Failed to save assistant message");
  }

  return {
    id: inserted.id,
    session_id: inserted.session_id,
    role: "assistant",
    message: inserted.message,
    created_at: inserted.created_at,
  };
}
