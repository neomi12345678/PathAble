"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { Question } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getMockQuestions, submitMockAssessment } from "@/lib/mock/api";

const SCALE_LABELS = ["1", "2", "3", "4", "5"] as const;

export function AssessmentForm() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    summary: string;
    strengths: string[];
    challenges: string[];
    recommendations: string[];
  } | null>(null);

  useEffect(() => {
    getMockQuestions()
      .then(setQuestions)
      .catch(() => setError("אירעה שגיאה בטעינת השאלון"))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAnswer = (questionId: string, value: number): void => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (): Promise<void> => {
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setError("יש לענות על כל השאלות לפני שליחה");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await submitMockAssessment(answers);
      setResult(response);
      toast.success("האבחון הושלם בהצלחה");
    } catch {
      setError("אירעה שגיאה, נסה שוב");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p className="text-muted">טוען שאלון...</p>;
  }

  if (result) {
    return (
      <div className="space-y-4">
        <Card>
          <h3 className="font-bold">תוצאות האבחון</h3>
          <p className="mt-2 text-sm text-muted">{result.summary}</p>
        </Card>
        <Card>
          <h4 className="font-medium">חוזקות</h4>
          <ul className="mt-2 list-inside list-disc text-sm">
            {result.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <h4 className="font-medium">המלצות מקצועיות</h4>
          <ul className="mt-2 list-inside list-disc text-sm">
            {result.recommendations.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Card>
      </div>
    );
  }

  const categories = Array.from(new Set(questions.map((q) => q.category)));

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-red-300 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => setError(null)}
          >
            נסה שוב
          </Button>
        </Card>
      )}

      {categories.map((category) => (
        <div key={category}>
          <h3 className="mb-3 text-lg font-bold">{category}</h3>
          <div className="space-y-3">
            {questions
              .filter((q) => q.category === category)
              .map((question) => (
                <Card key={question.id}>
                  <p className="text-sm font-medium">{question.title}</p>
                  <div className="mt-3 flex gap-2">
                    {SCALE_LABELS.map((label, index) => {
                      const value = index + 1;
                      const isSelected = answers[question.id] === value;

                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => handleAnswer(question.id, value)}
                          className={`h-10 w-10 rounded-xl border text-sm transition-colors focus-visible:ring-2 focus-visible:ring-primary ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-border hover:bg-background"
                          }`}
                          aria-label={`דירוג ${value}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </Card>
              ))}
          </div>
        </div>
      ))}

      <Button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "שולח..." : "שלח אבחון"}
      </Button>
    </div>
  );
}
