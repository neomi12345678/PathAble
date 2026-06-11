import Link from "next/link";
import { Button } from "@/components/ui/Button";

const HERO_TITLE = "עתיד מתאים";
const HERO_SUBTITLE =
  "פלטפורמת הכוונה תעסוקתית לאנשים עם מוגבלויות בישראל";
const CTA_LABEL = "כניסה למערכת";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold text-primary">{HERO_TITLE}</h1>
      <p className="max-w-xl text-lg text-muted">{HERO_SUBTITLE}</p>
      <Link href="/dashboard">
        <Button>{CTA_LABEL}</Button>
      </Link>
    </main>
  );
}
