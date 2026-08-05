import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/data/auth";
import {
  getSkillModuleByIdFromDb,
  parseSkillProgressMeta,
  upsertUserProgress,
  getModuleProgressFromDb,
} from "@/lib/data/modules";
import { awardModuleBadges } from "@/lib/data/achievements";
import { logger } from "@/lib/logger";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { parseBody, skillsProgressSchema } from "@/utils/validation";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
    }

    const rate = await checkRateLimit(`skills:${user.id}`, 60, 60 * 60_000);
    if (!rate.ok) return rateLimitResponse(rate.retryAfterSec);

    const body = await request.json();
    const parsed = parseBody(skillsProgressSchema, body);

    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { skillId, questionId, selectedOptionId, isLast } = parsed.data;

    const skillDetail = await getSkillModuleByIdFromDb(skillId);
    if (!skillDetail) {
      return NextResponse.json({ error: "מיומנות לא נמצאה" }, { status: 404 });
    }

    const question = skillDetail.questions.find((q) => q.id === questionId);
    if (!question) {
      return NextResponse.json({ error: "שאלה לא נמצאה" }, { status: 404 });
    }

    const validOption = question.options.some((o) => o.id === selectedOptionId);
    if (!validOption) {
      return NextResponse.json({ error: "תשובה לא תקינה" }, { status: 400 });
    }

    const isCorrect = selectedOptionId === question.correctOptionId;
    const totalQuestions = skillDetail.questions.length;

    const existing = await getModuleProgressFromDb(user.id, skillId, "skill");
    const meta = parseSkillProgressMeta(existing?.progress_meta ?? null);

    const alreadyAnswered = meta.answeredQuestionIds.includes(questionId);
    const answeredQuestionIds = alreadyAnswered
      ? meta.answeredQuestionIds
      : [...meta.answeredQuestionIds, questionId];
    const correctCount = alreadyAnswered
      ? meta.correctCount
      : meta.correctCount + (isCorrect ? 1 : 0);

    const progress = Math.round(
      (answeredQuestionIds.length / totalQuestions) * 100
    );
    const completed = isLast && answeredQuestionIds.length >= totalQuestions;

    await upsertUserProgress(
      user.id,
      skillId,
      "skill",
      progress,
      completed,
      { answeredQuestionIds, correctCount }
    );

    if (completed) {
      await awardModuleBadges(user.id, "skill");
    }

    return NextResponse.json({
      data: {
        isCorrect,
        progress,
        completed,
        correctCount,
        totalQuestions,
      },
    });
  } catch (error) {
    logger.error("Skills progress failed", { error: String(error) });
    return NextResponse.json({ error: "שגיאה פנימית" }, { status: 500 });
  }
}
