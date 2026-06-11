import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getMockProfessionById } from "@/lib/mock/api";

interface ProfessionDetailPageProps {
  params: { id: string };
}

export default async function ProfessionDetailPage({
  params,
}: ProfessionDetailPageProps) {
  const profession = await getMockProfessionById(params.id);

  if (!profession) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        href="/dashboard/professions"
        className="text-sm text-primary hover:underline"
      >
        → חזרה למאגר
      </Link>
      <Card>
        <h2 className="text-2xl font-bold">{profession.name}</h2>
        <p className="mt-2 text-muted">{profession.description}</p>
        <div className="mt-4 space-y-2 text-sm">
          <p>💰 שכר: {profession.salary_range}</p>
          <p>🎓 השכלה: {profession.education}</p>
          <p>🏢 סביבת עבודה: {profession.work_environment}</p>
          <p>👥 אינטראקציה חברתית: {profession.social_interaction_level}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {profession.skills.map((skill) => (
            <Badge key={skill}>{skill}</Badge>
          ))}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium">התאמה למוגבלויות:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {profession.disability_fit.map((fit) => (
              <Badge key={fit}>{fit}</Badge>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
