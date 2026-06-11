import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  getMockAssessmentResult,
  getMockProfessions,
  getMockSavedProfessionIds,
  getMockUserProgress,
} from "@/lib/mock/api";
import { mockProfile } from "@/lib/mock/profile";

export default async function ProfilePage() {
  const [assessment, savedIds, professions, progress] = await Promise.all([
    getMockAssessmentResult(),
    getMockSavedProfessionIds(),
    getMockProfessions(),
    getMockUserProgress(),
  ]);

  const savedProfessions = professions.filter((p) =>
    savedIds.includes(p.id)
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold">אזור אישי</h2>

      <Card>
        <h3 className="font-bold">פרטים אישיים</h3>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <p>
            שם: {mockProfile.first_name} {mockProfile.last_name}
          </p>
          <p>גיל: {mockProfile.age}</p>
          <p>עיר: {mockProfile.city}</p>
          <p>מגזר: {mockProfile.sector}</p>
          <p>מוגבלות: {mockProfile.disability_type}</p>
          <p>אימייל: {mockProfile.email}</p>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold">תוצאות אבחון</h3>
        <p className="mt-2 text-sm text-muted">{assessment.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {assessment.recommendations.map((rec) => (
            <Badge key={rec}>{rec}</Badge>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-bold">מקצועות שמורים</h3>
        <ul className="mt-2 space-y-1 text-sm">
          {savedProfessions.map((p) => (
            <li key={p.id}>★ {p.name}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <h3 className="font-bold">התקדמות</h3>
        <ul className="mt-2 space-y-2 text-sm">
          {progress.map((item) => (
            <li key={item.id}>
              {item.module_type === "learning" ? "📚" : "💪"}{" "}
              {item.progress}% {item.completed ? "✓" : ""}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
