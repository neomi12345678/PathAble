import { createClient } from "@/lib/supabase/server";
import { getOpenAIClient } from "@/lib/openai";
import { CHAT_ADVISOR_PROMPT } from "@/lib/prompts";
import { getProfessionMatchScore } from "@/lib/disability-matching";
import { logger } from "@/lib/logger";
import type { ChatMessage, Profession } from "@/types";
import type { AutismLevel } from "@/lib/user-profile";
import { getProfileByUserId, getProfilePrefsForUser } from "./profile";
import { getProfessionsFromDb } from "./catalog";

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

interface AdvisorContext {
  firstName: string;
  sector: string;
  disabilityType: string;
  autismLevel?: AutismLevel;
  city?: string;
  assessmentSummary: string;
  strengths: string[];
  recommendations: string[];
  professions: Profession[];
}

function topProfessions(ctx: AdvisorContext, limit = 3): string[] {
  if (!ctx.disabilityType) {
    return ctx.recommendations.slice(0, limit);
  }
  return [...ctx.professions]
    .map((p) => ({
      name: p.name,
      score: getProfessionMatchScore(
        p,
        ctx.disabilityType,
        ctx.autismLevel
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((p) => `${p.name} (${p.score}% התאמה)`);
}

/** תשובות מבוססות פרופיל כשאין OpenAI — כדי שהיועץ לא «ייפול» */
function buildLocalAdvisorReply(
  userMessage: string,
  ctx: AdvisorContext
): string {
  const text = userMessage.trim();
  const name = ctx.firstName !== "משתמש" ? ctx.firstName : "שלום";
  const diagnosisLine = ctx.disabilityType
    ? ctx.autismLevel
      ? `${ctx.disabilityType} · תפקוד ${ctx.autismLevel}`
      : ctx.disabilityType
    : "עדיין לא צוינה אבחנה בפרופיל";

  const tops = topProfessions(ctx);
  const topsBlock =
    tops.length > 0
      ? tops.map((t, i) => `${i + 1}. ${t}`).join("\n")
      : "1. בדיקות תוכנה (QA)\n2. הזנת נתונים\n3. הנהלת חשבונות";

  if (/מקצוע|ייעוד|קריירה|מה מתאים|איזה תפקיד/.test(text)) {
    return [
      `${name}, לפי הפרופיל שלך (${diagnosisLine})${
        ctx.city ? ` והעיר ${ctx.city}` : ""
      } — אלה כיוונים חזקים להתחיל מהם:`,
      "",
      topsBlock,
      "",
      ctx.assessmentSummary !== "טרם בוצע אבחון"
        ? `מסיכום האבחון: ${ctx.assessmentSummary}`
        : "מומלץ גם להשלים את האבחון התעסוקתי לדיוק גבוה יותר.",
      "",
      "אפשר לפתוח את «מאגר מקצועות» כדי לשמור מסלול, או את «לוח משרות» לראות משרות קרובות.",
    ].join("\n");
  }

  if (/ראיון|הכנה לראיון|איך להתכונן/.test(text)) {
    return [
      `${name}, כמה צעדים פרקטיים להכנה לראיון:`,
      "1. הכינו 2–3 דוגמאות קצרות לעבודה/למידה שעשיתם (מצב → פעולה → תוצאה).",
      "2. בדקו מראש את המשרה: שעות, עבודה מהבית, ליווי — ושאלו על זה בראיון.",
      "3. תרגלו בקול תשובה קצרה ל«ספרו על עצמכם» (כדקה).",
      "",
      "במרכז הלמידה יש מודולים שמכסים בדיוק את זה — כדאי להתחיל משם.",
    ].join("\n");
  }

  if (/זכות|זכויות|שכר|פיטור|חופשה|הבראה/.test(text)) {
    return [
      `${name}, בעמוד «זכויות עובדים» יש הסברים ומחשבון אישי לחופשה, מחלה, הבראה ופיצויים.`,
      "חשוב: זה מידע כללי ולא ייעוץ משפטי — במקרה של מחלוקת פנו לארגון מסייע מהרשימה שם.",
    ].join("\n");
  }

  if (/משרה|עבודה|דרושים|איפה לעבוד/.test(text)) {
    return [
      `${name}, בלוח המשרות אפשר לסנן לפי אזור${
        ctx.city ? ` (למשל ${ctx.city})` : ""
      }, עבודה מהבית ואינטראקציה חברתית נמוכה.`,
      "",
      "מקצועות מומלצים כבסיס לחיפוש:",
      topsBlock,
      "",
      "לחצו על משרה כדי לראות ציון התאמה ואז להגיש בדרושים.",
    ].join("\n");
  }

  return [
    `${name}, אני כאן לעזור בנושאי מקצועות, משרות, הכנה לראיונות וזכויות.`,
    `בפרופיל שלך כרגע: ${diagnosisLine}${
      ctx.city ? ` · ${ctx.city}` : ""
    }.`,
    "",
    ctx.strengths.length
      ? `חוזקות שזוהו: ${ctx.strengths.join(", ")}.`
      : "אחרי אבחון תעסוקתי אוכל להתבסס גם על החוזקות שלך.",
    "",
    "שאלו למשל: «איזה מקצוע מתאים לי?», «איך להתכונן לראיון?», או «מה הזכויות שלי?»",
  ].join("\n");
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
  const [{ data: resultRow }, professions, prefs] = await Promise.all([
    supabase
      .from("assessment_results")
      .select("summary, strengths, recommendations")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getProfessionsFromDb(),
    getProfilePrefsForUser(userId),
  ]);

  const ctx: AdvisorContext = {
    firstName: profile?.first_name ?? "משתמש",
    sector: prefs?.sector ?? profile?.sector ?? "לא צוין",
    disabilityType:
      prefs?.disability_type?.trim() ||
      profile?.disability_type?.trim() ||
      "",
    autismLevel: prefs?.autism_level,
    city: prefs?.city?.trim() || profile?.city?.trim() || undefined,
    assessmentSummary: resultRow?.summary ?? "טרם בוצע אבחון",
    strengths: resultRow?.strengths ?? [],
    recommendations: resultRow?.recommendations ?? [],
    professions,
  };

  const diagnosisLabel = ctx.autismLevel
    ? `${ctx.disabilityType} · תפקוד ${ctx.autismLevel}`
    : ctx.disabilityType || "לא צוין";

  const systemPrompt = CHAT_ADVISOR_PROMPT.replace(
    "{first_name}",
    ctx.firstName
  )
    .replace("{sector}", ctx.sector)
    .replace("{disability_type}", diagnosisLabel)
    .replace("{assessment_summary}", ctx.assessmentSummary)
    .replace("{strengths}", ctx.strengths.join(", ") || "—")
    .replace(
      "{recommendations}",
      ctx.recommendations.join(", ") || "—"
    );

  const openai = getOpenAIClient();
  let assistantText = buildLocalAdvisorReply(message, ctx);

  if (openai) {
    try {
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
      const aiText = completion.choices[0]?.message?.content?.trim();
      if (aiText) assistantText = aiText;
    } catch (error) {
      logger.error("OpenAI chat failed — using local advisor", {
        error: String(error),
      });
    }
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
