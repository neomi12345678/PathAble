"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { LearningQuizQuestion } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { COMMON, LEARNING } from "@/utils/texts";

interface ModuleQuizProps {
  moduleId: string;
  questions: LearningQuizQuestion[];
}

export function ModuleQuiz({ moduleId, questions }: ModuleQuizProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (questionId: string, optionId: string): void => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async (): Promise<void> => {
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setError("יש לענות על כל השאלות");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/learning/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, answers }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? LEARNING.quizFail);
        return;
      }

      toast.success(LEARNING.quizSuccess);
      router.refresh();
    } catch {
      setError(COMMON.genericError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-bold">{LEARNING.quizTitle}</h3>
      <div className="mt-4 space-y-4">
        {questions.map((question) => (
          <fieldset key={question.id} className="space-y-2">
            <legend className="text-sm font-medium">{question.question}</legend>
            {question.options.map((option) => {
              const isSelected = answers[question.id] === option.id;
              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-background"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.id}
                    checked={isSelected}
                    onChange={() => handleSelect(question.id, option.id)}
                    className="accent-primary"
                  />
                  {option.text}
                </label>
              );
            })}
          </fieldset>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <Button className="mt-4" onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? LEARNING.quizSubmitting : LEARNING.quizSubmit}
      </Button>
    </Card>
  );
}
