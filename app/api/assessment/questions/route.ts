import { NextResponse } from "next/server";
import { getQuestions } from "@/lib/data";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const questions = await getQuestions();
    if (questions.length === 0) {
      return NextResponse.json(
        {
          error:
            "שאלות האבחון לא זמינות — הרץ npm run seed או בדוק את חיבור Supabase",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ data: questions });
  } catch (error) {
    logger.error("Assessment questions fetch failed", { error: String(error) });
    return NextResponse.json({ error: "שגיאה בטעינת שאלות האבחון" }, { status: 500 });
  }
}
