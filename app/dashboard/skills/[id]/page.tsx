import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getSkillModuleDetailAsync,
  getSkillModuleProgressAsync,
} from "@/lib/data";
import { parseSkillProgressMeta } from "@/lib/data/modules";
import { SkillExercise } from "@/components/skills/SkillExercise";

interface SkillExercisePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: SkillExercisePageProps): Promise<Metadata> {
  const { id } = await params;
  const detail = await getSkillModuleDetailAsync(id);
  return {
    title: detail ? `תרגיל: ${detail.title} | עתיד מתאים` : "תרגיל לא נמצא",
  };
}

export default async function SkillExercisePage({
  params,
}: SkillExercisePageProps) {
  const { id } = await params;
  const detail = await getSkillModuleDetailAsync(id);

  if (!detail) {
    notFound();
  }

  const progress = await getSkillModuleProgressAsync(id);
  const meta = parseSkillProgressMeta(progress?.progress_meta ?? null);

  return (
    <SkillExercise
      skillId={detail.id}
      skillTitle={detail.title}
      questions={detail.questions}
      initialProgress={progress?.progress ?? 0}
      initialCompleted={progress?.completed ?? false}
      initialAnsweredCount={meta.answeredQuestionIds.length}
      initialCorrectCount={meta.correctCount}
    />
  );
}
