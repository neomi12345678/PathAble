import { Card } from "@/components/ui/Card";
import { getMockAchievementBadges } from "@/lib/mock/api";

export default async function AchievementsPage() {
  const badges = await getMockAchievementBadges();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">הישגים</h2>
        <p className="text-muted">תגים ואבני דרך</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((badge) => (
          <Card
            key={badge.id}
            className={`text-center ${badge.earned ? "" : "opacity-50"}`}
          >
            <span className="text-4xl">{badge.emoji}</span>
            <h3 className="mt-2 font-bold">{badge.title}</h3>
            <p className="mt-1 text-sm text-muted">{badge.condition}</p>
            {badge.earned && (
              <p className="mt-2 text-xs text-secondary">הושג!</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
