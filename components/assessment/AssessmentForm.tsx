"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Question } from "@/types";
import { SkeletonList } from "@/components/ui/Skeleton";
import { ASSESSMENT, COMMON } from "@/utils/texts";

const SCALE = [
  { value: 1, label: "בכלל לא", desc: "זה ממש לא מאפיין אותי", icon: "do_not_disturb_on" },
  { value: 2, label: "מעט", desc: "זה מאפיין אותי במידה מועטה", icon: "remove" },
  { value: 3, label: "בינוני", desc: "זה מאפיין אותי לפעמים", icon: "drag_handle" },
  { value: 4, label: "הרבה", desc: "זה מאפיין אותי במידה רבה", icon: "add" },
  { value: 5, label: "מאוד", desc: "זה ממש מאפיין אותי", icon: "check_circle" },
];

interface AssessmentResult {
  summary: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
}

interface AssessmentFormProps {
  initialResult?: AssessmentResult | null;
}

export function AssessmentForm({ initialResult = null }: AssessmentFormProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(!initialResult);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(initialResult);

  useEffect(() => {
    if (initialResult) return;

    fetch("/api/assessment/questions", { credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.length) setQuestions(json.data);
        else
          setError(
            json.error ??
              "שאלות האבחון לא זמינות — ודא שה-DB מולא (npm run seed)"
          );
      })
      .catch(() => setError(COMMON.genericError))
      .finally(() => setIsLoading(false));
  }, [initialResult]);

  useEffect(() => {
    if (!result || initialResult) return;

    const timer = setTimeout(() => {
      router.push("/dashboard/professions");
      router.refresh();
    }, 3000);

    return () => clearTimeout(timer);
  }, [result, initialResult, router]);

  const handleAnswer = (questionId: string, value: number): void => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (): Promise<void> => {
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setError(ASSESSMENT.incomplete);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/assessment/submit", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? COMMON.genericError);
        return;
      }

      setResult(json.data);
      toast.success(ASSESSMENT.success);
    } catch {
      setError(COMMON.genericError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <SkeletonList count={3} />;
  }

  if (result) {
    return (
      <>
        {!initialResult && (
          <p className="mb-4 text-center text-sm font-bold text-primary">
            מעביר אותך למאגר המקצועות...
          </p>
        )}
        <AssessmentResults result={result} />
      </>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-xl bg-error-container px-4 py-3 text-on-error-container">
        {error ?? COMMON.genericError}
      </div>
    );
  }

  const question = questions[current];
  const total = questions.length;
  const percent = Math.round(((current + (answers[question.id] ? 1 : 0)) / total) * 100);
  const isLast = current === total - 1;
  const selected = answers[question.id];

  const goNext = (): void => {
    if (!selected) {
      setError(ASSESSMENT.incomplete);
      return;
    }
    setError(null);
    if (isLast) {
      void handleSubmit();
    } else {
      setCurrent((c) => Math.min(c + 1, total - 1));
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <div className="mb-3 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary opacity-80">
              שלב האבחון
            </span>
            <span className="text-base font-black text-on-surface">
              שאלה {current + 1} מתוך {total}
            </span>
          </div>
          <span className="text-xs font-bold text-on-surface-variant">
            {percent}% הושלמו
          </span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-highest">
          <div
            className="h-full rounded-full bg-gradient-to-l from-primary to-primary-container transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="glass-card mb-5 rounded-2xl p-5 md:p-6">
        <div className="mb-6 text-center">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-fixed text-on-primary-fixed shadow-inner">
            <span className="material-symbols-outlined text-2xl">psychology</span>
          </div>
          <h2 className="mb-2 font-display text-xl font-black leading-tight text-on-surface md:text-2xl">
            {question.title}
          </h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-on-surface-variant">
            בחר את התשובה שמרגישה לך הכי מדויקת. אין תשובה נכונה או לא נכונה.
          </p>
        </div>

        <div className="space-y-2.5">
          {SCALE.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleAnswer(question.id, opt.value)}
                aria-pressed={isSelected}
                className={`option-card group flex w-full flex-row-reverse items-center gap-4 rounded-xl border-[1.5px] bg-white p-3.5 text-right ${
                  isSelected ? "option-selected" : "border-surface-container-highest"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all ${
                    isSelected
                      ? "bg-primary text-white shadow-md"
                      : "bg-surface-container text-on-surface-variant group-hover:bg-primary group-hover:text-white"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{opt.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="mb-0.5 text-sm font-bold text-on-surface">
                    {opt.label}
                  </h3>
                  <p className="text-xs font-medium text-on-surface-variant">
                    {opt.desc}
                  </p>
                </div>
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    isSelected ? "border-primary bg-white" : "border-outline-variant"
                  }`}
                >
                  <div
                    className={`h-2.5 w-2.5 rounded-full bg-primary transition-opacity ${
                      isSelected ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-error-container px-3 py-2 text-xs text-on-error-container">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-row-reverse items-center justify-between gap-3 border-t border-outline-variant/30 pt-5">
          <button
            type="button"
            onClick={goNext}
            disabled={isSubmitting}
            className="btn-premium flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30 active:scale-95 disabled:opacity-60"
          >
            <span>
              {isLast
                ? isSubmitting
                  ? ASSESSMENT.submitting
                  : ASSESSMENT.submit
                : "המשך לשאלה הבאה"}
            </span>
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrent((c) => Math.max(c - 1, 0))}
            disabled={current === 0}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-on-surface-variant transition-all hover:bg-surface-container disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
            <span>חזרה</span>
          </button>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-secondary-fixed bg-secondary-fixed/30 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
          <span className="material-symbols-outlined text-base">tips_and_updates</span>
        </div>
        <p className="text-sm leading-relaxed text-on-secondary-fixed-variant">
          <span className="font-bold">טיפ מקצועי:</span> אין תשובות שגויות. המטרה
          היא למצוא את המסלול שיאפשר לך להצטיין באמת. קח את הזמן לחשוב מה באמת גורם
          לך להרגיש בבית.
        </p>
      </div>
    </div>
  );
}

const REC_ICONS = ["terminal", "monitoring", "architecture", "design_services"];
const CHALLENGE_ICONS = [
  "psychology",
  "school",
  "groups",
  "self_improvement",
  "lightbulb",
];

function strengthBarHeight(index: number, total: number): number {
  if (total <= 1) return 90;
  return Math.round(90 - (index / (total - 1)) * 40);
}

function challengeBarWidth(index: number, total: number): number {
  if (total <= 1) return 85;
  return Math.round(85 - (index / (total - 1)) * 35);
}

function AssessmentResults({ result }: { result: AssessmentResult }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 200);
    return () => clearTimeout(t);
  }, []);

  const bars = result.strengths.slice(0, 5);
  const challenges = result.challenges.slice(0, 5);
  const primaryStrength = result.strengths[0];

  return (
    <div className="flex flex-col gap-8 text-right" aria-label={ASSESSMENT.resultsTitle}>
      <section className="mb-4">
        <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
          סיכום אבחון אישי
        </div>
        <h1 className="mb-6 font-display text-4xl font-black tracking-tight text-on-surface md:text-5xl">
          הכישורים שלך, <span className="text-gradient">העתיד שלך</span>
        </h1>
        <p className="max-w-3xl text-lg leading-relaxed text-on-surface-variant opacity-90">
          {result.summary}
        </p>
      </section>

      <div className="grid grid-cols-12 gap-6">
        <div className="glass-morphism relative col-span-12 overflow-hidden rounded-3xl p-5 shadow-sm sm:p-8 lg:col-span-8">
          <div className="mb-12 flex flex-row-reverse items-start justify-between">
            <div className="text-right">
              <h2 className="font-display text-2xl font-bold text-on-surface">
                פרופיל חוזקות רב-מימדי
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                שקלול ביצועים מבוסס אלגוריתם התנהגותי
              </p>
            </div>
            <div className="rounded-xl border border-white/50 bg-white p-3 shadow-inner">
              <span className="material-symbols-outlined text-3xl text-primary">
                insights
              </span>
            </div>
          </div>
          <div className="scroll-hide -mx-2 flex h-56 items-end justify-start gap-2 overflow-x-auto px-2 sm:mx-0 sm:h-72 sm:justify-around sm:gap-4 sm:px-2">
            {bars.map((label, idx) => {
              const h = strengthBarHeight(idx, bars.length);
              const amber = idx % 2 === 1;
              return (
                <div
                  key={label}
                  className="group flex w-14 shrink-0 flex-col items-center sm:w-full sm:max-w-[70px]"
                >
                  <div className="relative flex h-[90%] w-full items-end rounded-t-2xl bg-primary/5">
                    <div
                      className={`bar-anim w-full rounded-t-2xl ${
                        amber
                          ? "bg-gradient-to-t from-secondary to-secondary-container"
                          : "chart-bar-glow bg-gradient-to-t from-primary to-primary-container"
                      }`}
                      style={{ height: animate ? `${h}%` : "0%" }}
                    />
                    <span
                      className={`absolute -top-9 left-1/2 -translate-x-1/2 font-display text-lg font-black ${
                        amber ? "text-secondary" : "text-primary"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                  </div>
                  <span className="mt-3 text-center text-[11px] font-bold leading-tight text-on-surface-variant sm:mt-5 sm:text-sm">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-morphism group relative col-span-12 flex flex-col items-center overflow-hidden rounded-3xl p-8 text-center shadow-sm lg:col-span-4">
          <div className="relative z-10 mb-6 flex h-28 w-28 items-center justify-center rounded-full border-4 border-secondary/20 bg-white shadow-xl">
            <span className="material-symbols-outlined icon-fill text-6xl text-secondary">
              military_tech
            </span>
          </div>
          <h3 className="relative z-10 font-display text-2xl font-bold text-secondary">
            {primaryStrength ?? "חוזקה מרכזית"}
          </h3>
          <p className="relative z-10 mt-3 leading-relaxed text-on-surface-variant">
            {result.strengths.length > 1
              ? `חוזקות נוספות: ${result.strengths.slice(1, 3).join(" · ")}`
              : result.summary}
          </p>
          <div className="relative z-10 mt-8 rounded-full bg-secondary px-6 py-2 text-xs font-black uppercase tracking-widest text-on-secondary shadow-lg shadow-secondary/20">
            {result.strengths.length} חוזקות שזוהו
          </div>
        </div>

        <div className="col-span-12 mt-4">
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row-reverse sm:items-center sm:justify-between">
            <h2 className="font-display text-2xl font-black text-on-surface sm:text-3xl">
              מסלולי קריירה מותאמים
            </h2>
            <Link
              href="/dashboard/professions"
              className="flex items-center gap-1 text-sm font-bold text-primary transition-all hover:gap-2"
            >
              <span>צפה בכל האפשרויות</span>
              <span className="material-symbols-outlined text-sm">arrow_back</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {result.recommendations.map((rec, idx) => (
              <div
                key={rec}
                className="glass-morphism card-hover-effect group relative flex min-h-[240px] flex-col rounded-2xl border border-white/80 p-6 shadow-sm sm:min-h-[280px] sm:p-10"
              >
                <div className="mb-8 mt-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-transform group-hover:scale-110">
                    <span className="material-symbols-outlined text-3xl text-primary">
                      {REC_ICONS[idx % REC_ICONS.length]}
                    </span>
                  </div>
                </div>
                <h3 className="mb-8 flex-grow font-display text-xl font-bold text-on-surface">
                  {rec}
                </h3>
                <Link
                  href="/dashboard/professions"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white py-4 font-bold text-primary shadow-sm transition-all hover:bg-primary hover:text-white"
                >
                  חקור מסלול זה
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {challenges.length > 0 && (
          <div className="glass-morphism col-span-12 flex flex-col justify-center rounded-3xl border border-white p-10 shadow-sm lg:col-span-6">
            <h3 className="mb-10 font-display text-2xl font-bold text-primary">
              אזורים לחיזוק
            </h3>
            <div className="space-y-8">
              {challenges.map((label, idx) => {
                const width = challengeBarWidth(idx, challenges.length);
                const icon = CHALLENGE_ICONS[idx % CHALLENGE_ICONS.length];
                return (
                  <div key={label}>
                    <div className="mb-3 flex flex-row-reverse items-center justify-between">
                      <div className="flex flex-row-reverse items-center gap-4">
                        <div className="rounded-lg bg-primary/5 p-2">
                          <span className="material-symbols-outlined text-primary">
                            {icon}
                          </span>
                        </div>
                        <span className="font-bold text-on-surface">{label}</span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-1000"
                        style={{ width: animate ? `${width}%` : "0%" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div
          className={`glass-morphism-dark relative col-span-12 flex flex-col items-center justify-center overflow-hidden rounded-3xl p-10 text-center text-white ${
            challenges.length > 0 ? "lg:col-span-6" : "lg:col-span-12"
          }`}
        >
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary opacity-20 blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-secondary opacity-20 blur-[100px]" />
          <h3 className="relative z-10 mb-4 font-display text-3xl font-black">
            מוכנים לצעד הבא?
          </h3>
          <p className="relative z-10 mb-10 max-w-sm font-light leading-relaxed opacity-80">
            היועץ החכם שלנו פיתח עבורך תוכנית אישית שתקדם אותך ליעד התעסוקתי הנכון
            ביותר.
          </p>
          <Link
            href="/dashboard/chat"
            className="group relative z-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 font-display text-base font-black text-haredi-primary shadow-2xl transition-all hover:scale-105 hover:bg-secondary hover:text-white sm:w-auto sm:gap-4 sm:px-10 sm:py-5 sm:text-lg"
          >
            <span className="material-symbols-outlined text-3xl transition-transform group-hover:rotate-12">
              auto_awesome
            </span>
            התחלת שיחה עם יועץ AI
          </Link>
        </div>
      </div>
    </div>
  );
}
