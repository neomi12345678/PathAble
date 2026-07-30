import type { Metadata } from "next";
import { AssessmentForm } from "@/components/assessment/AssessmentForm";
import { getAssessmentResult } from "@/lib/data";
import { APP_NAME, ASSESSMENT } from "@/utils/texts";

export const metadata: Metadata = {
  title: `${ASSESSMENT.title} | ${APP_NAME}`,
  description: ASSESSMENT.subtitle,
};

export default async function AssessmentPage() {
  const existing = await getAssessmentResult();

  return (
    <AssessmentForm
      initialResult={
        existing
          ? {
              summary: existing.summary,
              strengths: existing.strengths,
              challenges: existing.challenges,
              recommendations: existing.recommendations,
            }
          : null
      }
    />
  );
}
