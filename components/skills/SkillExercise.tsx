"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SkillExerciseQuestion } from "@/types";
import { SKILLS } from "@/utils/texts";

const HEBREW_LETTERS = ["א", "ב", "ג", "ד", "ה", "ו"];

interface SkillExerciseProps {
  skillId: string;
  skillTitle: string;
  questions: SkillExerciseQuestion[];
  initialProgress: number;
  initialCompleted: boolean;
  initialAnsweredCount?: number;
  initialCorrectCount?: number;
}

export function SkillExercise({
  skillId,
  skillTitle,
  questions,
  initialProgress,
  initialCompleted,
  initialAnsweredCount = 0,
  initialCorrectCount = 0,
}: SkillExerciseProps) {
  const router = useRouter();
  const total = questions.length;

  const [currentIndex, setCurrentIndex] = useState(() =>
    total > 0 ? Math.min(initialAnsweredCount, total - 1) : 0
  );
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(initialCorrectCount);
  const [showSummary, setShowSummary] = useState(initialCompleted);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(initialProgress);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = total > 0 && currentIndex === total - 1;

  const progressPercent =
    total === 0
      ? 0
      : showSummary
        ? 100
        : Math.round(((currentIndex + (submitted ? 1 : 0)) / total) * 100);

  const handleSubmit = async (): Promise<void> => {
    if (!selectedOptionId || !currentQuestion) return;

    const correct = selectedOptionId === currentQuestion.correctOptionId;
    setIsCorrect(correct);
    setSubmitted(true);

    setIsSaving(true);
    try {
      const res = await fetch("/api/skills/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillId,
          questionId: currentQuestion.id,
          selectedOptionId,
          isLast: isLastQuestion,
        }),
      });
      const json = (await res.json()) as {
        data?: { correctCount: number; progress: number; completed: boolean };
      };
      if (res.ok && json.data) {
        setCorrectCount(json.data.correctCount);
        setProgress(json.data.progress);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = (): void => {
    if (isLastQuestion) {
      setShowSummary(true);
      router.refresh();
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedOptionId(null);
    setSubmitted(false);
    setIsCorrect(false);
  };

  if (total === 0 || !currentQuestion) {
    return (
      <div className="text-center">
        <p className="text-on-surface-variant">אין שאלות זמינות למיומנות זו.</p>
        <Link href="/dashboard/skills" className="mt-4 inline-block text-primary">
          {SKILLS.backToSkills}
        </Link>
      </div>
    );
  }

  if (showSummary) {
    const finalCorrect = correctCount;
    return (
      <div className="text-right">
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-1.5 text-on-primary-fixed">
            <span className="material-symbols-outlined text-[18px]">emoji_events</span>
            <span className="text-sm font-bold">{SKILLS.summaryTitle}</span>
          </div>
          <h1 className="mb-4 font-display text-4xl font-black text-on-background md:text-5xl">
            {skillTitle}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-on-surface-variant">
            {SKILLS.moduleComplete}
          </p>
        </header>

        <div className="glass-card rounded-[32px] p-8 text-center md:p-12">
          <div className="mb-6 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-container">
              <span className="font-display text-3xl font-black text-on-primary-container">
                {progress}%
              </span>
            </div>
          </div>
          <p className="text-xl text-on-surface">
            {SKILLS.summaryScore
              .replace("{correct}", String(finalCorrect))
              .replace("{total}", String(total))}
          </p>
          <Link
            href="/dashboard/skills"
            className="celebrate-btn mt-8 inline-block rounded-full px-12 py-3 font-display text-lg font-bold text-white shadow-xl"
          >
            {SKILLS.backToSkills}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="text-right">
      <header className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-1.5 text-on-primary-fixed">
          <span className="material-symbols-outlined text-[18px]">psychology</span>
          <span className="text-sm font-bold">תרגיל: {skillTitle}</span>
        </div>
        <h1 className="mb-4 font-display text-4xl font-black text-on-background md:text-5xl">
          {skillTitle}
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-on-surface-variant">
          {SKILLS.questionOf
            .replace("{current}", String(currentIndex + 1))
            .replace("{total}", String(total))}
          {" — "}
          קראו את השאלה ובחרו את התשובה הטובה ביותר.
        </p>
      </header>

      <div className="glass-card relative overflow-hidden rounded-[32px] p-8 shadow-2xl md:p-12">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-surface-container">
          <div
            className="h-full bg-primary-container transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <section className="mb-10">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-fixed-dim font-bold text-on-secondary-fixed">
              {currentIndex + 1}
            </div>
            <h2 className="font-display text-2xl font-semibold leading-tight text-on-surface md:text-3xl">
              {currentQuestion.question}
            </h2>
          </div>
        </section>

        <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {currentQuestion.options.map((opt, idx) => {
            const letter = HEBREW_LETTERS[idx] ?? String(idx + 1);
            const isSelected = selectedOptionId === opt.id;
            const showCorrect =
              submitted && opt.id === currentQuestion.correctOptionId;
            const showWrong =
              submitted && isSelected && opt.id !== currentQuestion.correctOptionId;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={submitted}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`option-card glass-card flex items-center gap-4 rounded-2xl p-6 text-right ${
                  showCorrect
                    ? "border-2 border-green-500 bg-green-50"
                    : showWrong
                      ? "border-2 border-red-500 bg-red-50"
                      : isSelected
                        ? "option-selected"
                        : "hover:bg-white/90"
                }`}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold ${
                    isSelected || showCorrect
                      ? "bg-primary text-white"
                      : "bg-surface-container text-primary"
                  }`}
                >
                  {letter}
                </div>
                <span className="text-lg text-on-surface">{opt.text}</span>
              </button>
            );
          })}
        </section>

        {submitted && (
          <div
            className={`mb-10 rounded-2xl border p-6 ${
              isCorrect
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${
                  isCorrect ? "bg-green-500" : "bg-red-500"
                }`}
              >
                <span className="material-symbols-outlined">
                  {isCorrect ? "check_circle" : "cancel"}
                </span>
              </div>
              <div>
                <h4
                  className={`mb-1 font-display text-xl font-semibold ${
                    isCorrect ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {isCorrect ? SKILLS.correctFeedback : SKILLS.incorrectFeedback}
                </h4>
                <p className={isCorrect ? "text-green-700" : "text-red-700"}>
                  {isCorrect
                    ? currentQuestion.explanationCorrect
                    : currentQuestion.explanationIncorrect}
                </p>
              </div>
            </div>
          </div>
        )}

        <footer className="flex flex-col items-center justify-between gap-6 border-t border-outline-variant/30 pt-8 md:flex-row">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined">timer</span>
            <span className="text-sm font-semibold">{SKILLS.avgTime}</span>
          </div>
          <div className="flex w-full items-center gap-4 md:w-auto">
            <Link
              href="/dashboard/skills"
              className="flex-1 rounded-full border border-outline px-8 py-3 text-center font-body-md transition-all hover:bg-surface-variant md:flex-none"
            >
              {SKILLS.backToSkills}
            </Link>
            {submitted ? (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleNext}
                className="celebrate-btn flex-1 rounded-full px-12 py-3 font-display text-lg font-bold text-white shadow-xl md:flex-none"
              >
                {isSaving
                  ? SKILLS.saving
                  : isLastQuestion
                    ? SKILLS.summaryTitle
                    : SKILLS.nextQuestion}
              </button>
            ) : (
              <button
                type="button"
                disabled={selectedOptionId === null}
                onClick={() => void handleSubmit()}
                className={`celebrate-btn flex-1 rounded-full px-12 py-3 font-display text-lg font-bold text-white shadow-xl md:flex-none ${
                  selectedOptionId === null ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                {SKILLS.submitAnswer}
              </button>
            )}
          </div>
        </footer>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="glass-card rounded-2xl border-l-4 border-primary p-6">
          <span className="material-symbols-outlined icon-fill mb-3 text-primary">
            lightbulb
          </span>
          <h3 className="mb-2 font-display text-xl font-semibold text-on-surface">
            {SKILLS.professionalTip}
          </h3>
          <p className="text-on-surface-variant">
            {currentQuestion.tip ??
              "קחו רגע לחשוב לפני שבוחרים — אין צורך למהר."}
          </p>
        </div>
        <div className="glass-card rounded-2xl border-l-4 border-secondary-container p-6">
          <span className="material-symbols-outlined icon-fill mb-3 text-secondary-container">
            star
          </span>
          <h3 className="mb-2 font-display text-xl font-semibold text-on-surface">
            {SKILLS.yourProgress}
          </h3>
          <p className="text-on-surface-variant">
            {correctCount > 0
              ? SKILLS.summaryScore
                  .replace("{correct}", String(correctCount))
                  .replace("{total}", String(total))
              : `התקדמות: ${progress}%`}
          </p>
        </div>
        <div className="glass-card rounded-2xl border-l-4 border-tertiary-container p-6">
          <span className="material-symbols-outlined icon-fill mb-3 text-tertiary-container">
            groups
          </span>
          <h3 className="mb-2 font-display text-xl font-semibold text-on-surface">
            {SKILLS.community}
          </h3>
          <p className="text-on-surface-variant">
            {currentIndex + 1} מתוך {total} משתמשים מסיימים את התרגיל בשלב זה.
          </p>
        </div>
      </div>
    </div>
  );
}
