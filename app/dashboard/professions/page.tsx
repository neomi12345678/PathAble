import { ProfessionCard } from "@/components/professions/ProfessionCard";
import { getMockProfessions, getMockSavedProfessionIds } from "@/lib/mock/api";

export default async function ProfessionsPage() {
  const [professions, savedIds] = await Promise.all([
    getMockProfessions(),
    getMockSavedProfessionIds(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">מאגר מקצועות</h2>
        <p className="text-muted">
          {professions.length} מקצועות זמינים
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {professions.map((profession) => (
          <ProfessionCard
            key={profession.id}
            profession={profession}
            isSaved={savedIds.includes(profession.id)}
          />
        ))}
      </div>
    </div>
  );
}
