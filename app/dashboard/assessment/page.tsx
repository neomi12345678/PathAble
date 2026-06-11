import { AssessmentForm } from "@/components/assessment/AssessmentForm";

export default function AssessmentPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">שאלון אבחון תעסוקתי</h2>
        <p className="text-muted">
          דרג כל שאלה מ-1 (בכלל לא) עד 5 (מאוד)
        </p>
      </div>
      <AssessmentForm />
    </div>
  );
}
