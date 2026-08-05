import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/data/auth";
import {
  getLearningModuleByIdFromDb,
  upsertUserProgress,
} from "@/lib/data/modules";
import { awardModuleBadges } from "@/lib/data/achievements";
import { logger } from "@/lib/logger";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { learningCompleteSchema, parseBody } from "@/utils/validation";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
    }

    const rate = await checkRateLimit(`learning:${user.id}`, 20, 60 * 60_000);
    if (!rate.ok) return rateLimitResponse(rate.retryAfterSec);

    const body = await request.json();
    const parsed = parseBody(learningCompleteSchema, body);

    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { moduleId, answers } = parsed.data;

    const learningModule = await getLearningModuleByIdFromDb(moduleId);
    if (!learningModule) {
      return NextResponse.json({ error: "מודול לא נמצא" }, { status: 404 });
    }

    const allCorrect = learningModule.quiz.every(
      (q) => answers[q.id] === q.correctOptionId
    );

    if (!allCorrect) {
      return NextResponse.json(
        { error: "לא כל התשובות נכונות", data: { passed: false } },
        { status: 400 }
      );
    }

    await upsertUserProgress(user.id, moduleId, "learning", 100, true);
    await awardModuleBadges(user.id, "learning");

    return NextResponse.json({
      data: { passed: true, progress: 100, completed: true },
    });
  } catch (error) {
    logger.error("Learning complete failed", { error: String(error) });
    return NextResponse.json({ error: "שגיאה פנימית" }, { status: 500 });
  }
}
