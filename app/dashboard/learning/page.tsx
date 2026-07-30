import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME, LEARNING } from "@/utils/texts";
import { getLearningModules, getLearningProgress } from "@/lib/data";
import { LearningModuleCard } from "@/components/learning/LearningModuleCard";

export const metadata: Metadata = {
  title: `${LEARNING.title} | ${APP_NAME}`,
  description: LEARNING.subtitle,
};

export default async function LearningPage() {
  const [modules, progressList] = await Promise.all([
    getLearningModules(),
    getLearningProgress(),
  ]);

  const completedCount = progressList.filter((p) => p.completed).length;
  const avgProgress =
    progressList.length > 0
      ? Math.round(
          progressList.reduce((sum, p) => sum + p.progress, 0) /
            progressList.length
        )
      : 0;

  const stats = [
    {
      value: String(completedCount),
      label: "שיעורים שהושלמו",
      icon: "verified",
      wrap: "bg-primary/10 text-primary",
      border: "border-b-primary",
    },
    {
      value: `${avgProgress}%`,
      label: "התקדמות ממוצעת",
      icon: "timer",
      wrap: "bg-secondary/10 text-secondary",
      border: "border-b-secondary",
    },
    {
      value: String(completedCount),
      label: "תעודות שהושגו",
      icon: "workspace_premium",
      wrap: "bg-tertiary/10 text-tertiary",
      border: "border-b-tertiary",
    },
  ];

  const getProgress = (
    moduleId: string
  ): { progress: number; completed: boolean } => {
    const item = progressList.find((p) => p.module_id === moduleId);
    return { progress: item?.progress ?? 0, completed: item?.completed ?? false };
  };

  const sortedModules = [...modules].sort(
    (a, b) => a.order_index - b.order_index
  );

  return (
    <div className="flex flex-col gap-12 text-right">
      <section className="animate-fade-up">
        <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
          מרכז הלמידה 2024
        </div>
        <h1 className="mb-4 font-display text-4xl font-black leading-tight tracking-tight text-on-background md:text-5xl">
          מוכנים להתקדם היום?
        </h1>
        <p className="max-w-2xl text-lg font-medium leading-relaxed text-on-surface-variant">
          כאן תמצאו את כל מה שצריך כדי לבנות את עתידכם המקצועי. ההתקדמות שלכם
          נשמרת אוטומטית.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`glass-morphism flex flex-col items-center justify-center rounded-2xl border-b-4 p-8 text-center transition-all hover:shadow-2xl ${s.border}`}
          >
            <div
              className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${s.wrap}`}
            >
              <span className="material-symbols-outlined text-3xl">{s.icon}</span>
            </div>
            <p className="font-display text-4xl font-black tracking-tight text-on-surface">
              {s.value}
            </p>
            <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
              {s.label}
            </p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-8 flex flex-row-reverse items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-black tracking-tight text-on-background">
              הקורסים שלי
            </h2>
            <p className="mt-1 font-medium text-on-surface-variant">
              ממשיכים בדיוק מאיפה שהפסקתם
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sortedModules.map((module, idx) => {
            const { progress, completed } = getProgress(module.id);
            return (
              <LearningModuleCard
                key={module.id}
                module={module}
                progress={progress}
                completed={completed}
                index={idx}
              />
            );
          })}
        </div>
      </section>

      <section className="relative mt-4 overflow-hidden rounded-[2rem] bg-gradient-to-br from-inverse-surface to-on-surface p-10 text-white shadow-2xl md:p-12">
        <div className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/2 translate-y-1/2 rounded-full bg-secondary/5 blur-[80px]" />
        <div className="relative z-10 flex flex-col items-center justify-between gap-12 md:flex-row-reverse md:text-right">
          <div className="flex-1">
            <div className="mb-6 flex justify-center md:justify-end">
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary-fixed backdrop-blur-md">
                AI Career Mentor
              </span>
            </div>
            <h2 className="mb-6 font-display text-4xl font-black leading-tight tracking-tight md:text-5xl">
              זקוקים להכוונה{" "}
              <span className="text-primary-fixed-dim">בבחירת הצעד הבא?</span>
            </h2>
            <p className="mb-10 max-w-xl text-lg font-medium leading-relaxed text-white/70">
              היועץ החכם שלנו מנתח את ההתקדמות שלכם ומציע את המסלולים הכי
              רלוונטיים עבורכם היום.
            </p>
            <div className="flex flex-row-reverse justify-center gap-4 md:justify-start">
              <Link
                href="/dashboard/chat"
                className="flex items-center gap-3 rounded-full bg-primary-fixed px-10 py-4 text-sm font-bold text-on-primary-fixed shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              >
                <span>התחל שיחה עכשיו</span>
                <span className="material-symbols-outlined">bolt</span>
              </Link>
              <Link
                href="/dashboard/professions"
                className="rounded-full border border-white/20 bg-white/5 px-10 py-4 text-sm font-bold text-white transition-all hover:bg-white/10"
              >
                למידע נוסף
              </Link>
            </div>
          </div>
          <div className="flex w-full justify-center md:w-1/3">
            <div className="relative">
              <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-primary/20 blur-2xl" />
              <span className="material-symbols-outlined text-[160px] text-primary-fixed-dim opacity-90 drop-shadow-2xl">
                smart_toy
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
