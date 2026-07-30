import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { COMMON, HOME } from "@/utils/texts";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold text-primary">404</h1>
      <p className="text-muted">הדף שחיפשת לא נמצא</p>
      <Link href="/">
        <Button>{COMMON.back}</Button>
      </Link>
      <Link href="/dashboard">
        <Button variant="outline">{HOME.cta}</Button>
      </Link>
    </main>
  );
}
