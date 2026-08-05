import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { LearningResource } from "@/types";
import { ModuleQuiz } from "@/components/learning/ModuleQuiz";
import { LEARNING } from "@/utils/texts";
import {
  getLearningModuleById,
  getModuleProgressAsync,
} from "@/lib/data";
import { courseImageForCategory } from "@/lib/assets/images";
import { learningModuleIdSchema } from "@/utils/validation";

interface LearningDetailPageProps {
  params: Promise<{ id: string }>;
}

const RESOURCE_ICON: Record<LearningResource["type"], string> = {
  video: "play_circle",
  article: "article",
  tool: "build",
  official: "verified",
};

function imageForModule(category: string, id: string): string {
  let sum = 0;
  for (const ch of id) sum += ch.charCodeAt(0);
  return courseImageForCategory(category, sum);
}

export async function generateMetadata({
  params,
}: LearningDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const idResult = learningModuleIdSchema.safeParse(id);
  if (!idResult.success) {
    return { title: "מודול לא נמצא | עתיד מתאים" };
  }

  const learningModule = await getLearningModuleById(idResult.data);
  return {
    title: learningModule
      ? `${learningModule.title} | עתיד מתאים`
      : "מודול לא נמצא",
  };
}

export default async function LearningDetailPage({
  params,
}: LearningDetailPageProps) {
  const { id } = await params;
  const idResult = learningModuleIdSchema.safeParse(id);

  if (!idResult.success) {
    notFound();
  }

  const learningModule = await getLearningModuleById(idResult.data);

  if (!learningModule) {
    notFound();
  }

  const progress = await getModuleProgressAsync(learningModule.id);
  const isCompleted = progress?.completed ?? false;
  const image = imageForModule(learningModule.category, learningModule.id);

  return (
    <article className="mx-auto max-w-4xl space-y-8 text-right">
      <Link
        href="/dashboard/learning"
        className="inline-flex items-center gap-1 text-sm font-bold text-primary transition-all hover:gap-2"
      >
        <span className="material-symbols-outlined text-base">arrow_forward</span>
        {LEARNING.backToCenter}
      </Link>

      <header className="relative overflow-hidden rounded-[2rem] shadow-xl">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${image}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-haredi-primary/95 via-haredi-primary/70 to-haredi-primary/40" />
        <div className="relative z-10 flex flex-col gap-4 p-8 text-white md:p-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold backdrop-blur">
              {learningModule.category}
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-bold">
                <span className="material-symbols-outlined text-base">
                  check_circle
                </span>
                {LEARNING.completed}
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl font-black leading-tight md:text-5xl">
            {learningModule.title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/90">
            {learningModule.content}
          </p>
          <div className="mt-2 flex flex-wrap gap-6 text-sm font-bold text-white/90">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">schedule</span>
              כ-{learningModule.durationMinutes} דקות
            </span>
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">menu_book</span>
              {learningModule.sections.length} שלבים
            </span>
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">quiz</span>
              {learningModule.quiz.length} שאלות בסיום
            </span>
          </div>
        </div>
      </header>

      {learningModule.takeaways.length > 0 && (
        <section className="rounded-3xl border border-primary/15 bg-primary/5 p-8">
          <h2 className="mb-5 flex items-center gap-2 font-display text-xl font-black text-primary">
            <span className="material-symbols-outlined">bolt</span>
            מה תלמדי במודול הזה
          </h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {learningModule.takeaways.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="material-symbols-outlined icon-fill mt-0.5 shrink-0 text-secondary">
                  task_alt
                </span>
                <span className="text-sm font-bold leading-relaxed text-on-surface">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-6 font-display text-2xl font-black text-on-surface">
          {LEARNING.sectionLabel}
        </h2>
        <ol className="space-y-4">
          {learningModule.sections.map((section, idx) => (
            <li
              key={section}
              className="flex gap-5 rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary font-display font-black text-white">
                {idx + 1}
              </div>
              <p className="self-center text-base leading-relaxed text-on-surface-variant">
                {section}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {learningModule.resources.length > 0 && (
        <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-8">
          <h2 className="mb-5 flex items-center gap-2 font-display text-xl font-black text-on-surface">
            <span className="material-symbols-outlined text-primary">
              link
            </span>
            חומרי העשרה ומקורות
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {learningModule.resources.map((resource) => (
              <a
                key={resource.url}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low/60 p-4 transition-all hover:border-primary hover:bg-primary/5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">
                    {RESOURCE_ICON[resource.type]}
                  </span>
                </span>
                <span className="flex-grow font-bold text-on-surface">
                  {resource.label}
                </span>
                <span className="material-symbols-outlined text-outline transition-colors group-hover:text-primary">
                  open_in_new
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {!isCompleted ? (
        <ModuleQuiz
          moduleId={learningModule.id}
          questions={learningModule.quiz}
        />
      ) : (
        <section className="flex flex-col items-center gap-3 rounded-3xl bg-emerald-50 p-10 text-center">
          <span className="material-symbols-outlined icon-fill text-5xl text-emerald-500">
            workspace_premium
          </span>
          <p className="font-display text-xl font-black text-emerald-800">
            {LEARNING.quizSuccess}
          </p>
          <Link
            href="/dashboard/learning"
            className="mt-2 rounded-2xl bg-primary px-8 py-3 font-bold text-white shadow-lg transition-all hover:brightness-110"
          >
            {LEARNING.backToCenter}
          </Link>
        </section>
      )}
    </article>
  );
}
