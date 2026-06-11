import { Card } from "@/components/ui/Card";
import { getMockSkillsModules, getMockUserProgress } from "@/lib/mock/api";

function getProgressBarClass(progress: number): string {
  if (progress >= 100) return "w-full";
  if (progress >= 75) return "w-3/4";
  if (progress >= 50) return "w-1/2";
  if (progress >= 25) return "w-1/4";
  return "w-1/12";
}

export default async function SkillsPage() {
  const [skills, userProgress] = await Promise.all([
    getMockSkillsModules(),
    getMockUserProgress(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">מיומנויות תעסוקה</h2>
        <p className="text-muted">תרגול מיומנויות לעבודה</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {skills.map((skill) => {
          const progress =
            userProgress.find(
              (p) => p.module_id === skill.id && p.module_type === "skill"
            )?.progress ?? 0;

          return (
            <Card key={skill.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{skill.title}</h3>
                <span className="text-xs text-muted">{skill.difficulty}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{skill.description}</p>
              <div className="mt-3 h-2 rounded-full bg-background">
                <div
                  className={`h-2 rounded-full bg-secondary ${getProgressBarClass(progress)}`}
                />
              </div>
              <p className="mt-1 text-xs text-muted">{progress}% הושלם</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
