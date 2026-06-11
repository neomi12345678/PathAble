import { Card } from "@/components/ui/Card";
import { getMockLearningModules } from "@/lib/mock/api";

export default async function LearningPage() {
  const modules = await getMockLearningModules();

  const categories = Array.from(new Set(modules.map((m) => m.category)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">מרכז למידה</h2>
        <p className="text-muted">מודולים להכנה לתעסוקה</p>
      </div>
      {categories.map((category) => (
        <div key={category}>
          <h3 className="mb-3 text-lg font-bold">{category}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {modules
              .filter((m) => m.category === category)
              .map((module) => (
                <Card key={module.id}>
                  <h4 className="font-medium">{module.title}</h4>
                  <p className="mt-1 text-sm text-muted">{module.content}</p>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
