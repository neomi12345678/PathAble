import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { mockProfile } from "@/lib/mock/profile";
import { mockAssessmentResult } from "@/lib/mock/assessment";

const QUICK_LINKS = [
  { href: "/dashboard/assessment", label: "אבחון תעסוקתי", emoji: "📋" },
  { href: "/dashboard/professions", label: "מאגר מקצועות", emoji: "💼" },
  { href: "/dashboard/chat", label: "יועץ AI", emoji: "💬" },
  { href: "/dashboard/profile", label: "אזור אישי", emoji: "👤" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          שלום, {mockProfile.first_name}!
        </h2>
        <p className="text-muted">ברוך הבא לעתיד מתאים</p>
      </div>

      <Card>
        <h3 className="font-bold">סיכום אבחון אחרון</h3>
        <p className="mt-2 text-sm text-muted">{mockAssessmentResult.summary}</p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:shadow-md transition-shadow">
              <span className="text-2xl">{link.emoji}</span>
              <p className="mt-2 font-medium">{link.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
