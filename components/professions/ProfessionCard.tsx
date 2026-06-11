import Link from "next/link";
import type { Profession } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface ProfessionCardProps {
  profession: Profession;
  isSaved?: boolean;
}

export function ProfessionCard({
  profession,
  isSaved = false,
}: ProfessionCardProps) {
  const cardClass =
    "hover:shadow-md transition-shadow";

  return (
    <Card className={cardClass}>
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-bold">{profession.name}</h3>
        {isSaved && (
          <span className="text-xs text-accent" aria-label="מקצוע שמור">
            ★
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted">{profession.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {profession.skills.map((skill) => (
          <Badge key={skill}>{skill}</Badge>
        ))}
      </div>
      <div className="mt-3 flex justify-between text-sm text-muted">
        <span>💰 {profession.salary_range}</span>
        <span>🎓 {profession.education}</span>
      </div>
      <Link
        href={`/dashboard/professions/${profession.id}`}
        className="mt-3 inline-block text-sm text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary"
      >
        לפרטים נוספים ←
      </Link>
    </Card>
  );
}
