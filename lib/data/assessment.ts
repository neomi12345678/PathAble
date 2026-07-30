import { createClient } from "@/lib/supabase/server";
import { getOpenAIClient } from "@/lib/openai";
import { CAREER_ADVISOR_PROMPT } from "@/lib/prompts";
import type { AssessmentResult } from "@/types";

interface AssessmentAiResult {
  summary: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
}

const DEFAULT_AI_RESULT: AssessmentAiResult = {
  summary:
    "עברת את האבחון בהצלחה. על בסיס התשובות שלך, יש לך פוטנציאל לתפקידים מובנים וברורים.",
  strengths: ["ריכוז", "דיוק", "עבודה עצמאית"],
  challenges: ["לחץ חברתי", "שינויים פתאומיים"],
  recommendations: [
    "מפתח/ת תוכנה",
    "ניהול נתונים",
    "עיצוב UX",
    "טכנאי/ת מחשבים",
  ],
};

export function mapAssessmentError(message: string): string {
  if (message.includes("foreign key") && message.includes("profiles")) {
    return "פרופיל המשתמש לא נמצא — נסה להתחבר מחדש";
  }
  if (message.includes("foreign key") && message.includes("questions")) {
    return "שאלות האבחון לא קיימות במערכת — הרץ npm run seed";
  }
  if (message.includes("row-level security") || message.includes("RLS")) {
    return "אין הרשאה לשמור את האבחון — התחבר מחדש";
  }
  if (message.includes("Unauthorized") || message.includes("JWT")) {
    return "לא מחובר — התחבר מחדש";
  }
  return "שגיאה בשמירת האבחון, נסה שוב";
}

export async function getAssessmentResultFromDb(
  userId: string
): Promise<AssessmentResult | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("assessment_results")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    user_id: data.user_id,
    summary: data.summary,
    strengths: data.strengths,
    challenges: data.challenges,
    recommendations: data.recommendations,
    created_at: data.created_at,
  };
}

async function generateAiResult(
  profile: { sector: string | null; disability_type: string | null } | null,
  answers: Record<string, number>
): Promise<AssessmentAiResult> {
  const openai = getOpenAIClient();
  if (!openai) return DEFAULT_AI_RESULT;

  const prompt = CAREER_ADVISOR_PROMPT.replace(
    "{sector}",
    profile?.sector ?? "לא צוין"
  ).replace("{disability_type}", profile?.disability_type ?? "לא צוין");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: JSON.stringify({ answers }) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return DEFAULT_AI_RESULT;

    try {
      return JSON.parse(raw) as AssessmentAiResult;
    } catch {
      return DEFAULT_AI_RESULT;
    }
  } catch {
    return DEFAULT_AI_RESULT;
  }
}

export async function submitAssessmentToDb(
  userId: string,
  answers: Record<string, number>
): Promise<{ result: AssessmentResult; message: string }> {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("sector, disability_type")
    .eq("id", userId)
    .maybeSingle();

  const { data: assessment, error: aErr } = await supabase
    .from("assessments")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (aErr || !assessment) throw new Error(aErr?.message ?? "Assessment failed");

  const answerRows = Object.entries(answers).map(([questionSlug, answer]) => ({
    assessment_id: assessment.id,
    question_slug: questionSlug,
    answer,
  }));
  const { error: ansErr } = await supabase.from("answers").insert(answerRows);
  if (ansErr) throw new Error(ansErr.message);

  const aiResult = await generateAiResult(profile, answers);

  const { data: saved, error: rErr } = await supabase
    .from("assessment_results")
    .insert({
      user_id: userId,
      summary: aiResult.summary,
      strengths: aiResult.strengths,
      challenges: aiResult.challenges,
      recommendations: aiResult.recommendations,
    })
    .select("*")
    .single();
  if (rErr || !saved) throw new Error(rErr?.message ?? "Save result failed");

  return {
    result: {
      id: saved.id,
      user_id: saved.user_id,
      summary: saved.summary,
      strengths: saved.strengths,
      challenges: saved.challenges,
      recommendations: saved.recommendations,
      created_at: saved.created_at,
    },
    message: "האבחון נשמר בהצלחה",
  };
}
