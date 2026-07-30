import Link from "next/link";
import { APP_NAME } from "@/utils/texts";

interface LegalPageProps {
  title: string;
  children: React.ReactNode;
}

export function LegalPage({ title, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-surface text-right">
      <header className="border-b border-outline-variant/20 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="font-display text-xl font-black text-primary">
            {APP_NAME}
          </Link>
          <Link
            href="/auth/login"
            className="text-sm font-bold text-primary hover:underline"
          >
            כניסה למערכת
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-8 font-display text-3xl font-black text-on-surface">
          {title}
        </h1>
        <div className="prose-legal space-y-6 text-on-surface-variant leading-relaxed">
          {children}
        </div>
        <p className="mt-12 text-sm text-outline">
          <Link href="/" className="font-bold text-primary hover:underline">
            ← חזרה לדף הבית
          </Link>
        </p>
      </main>
    </div>
  );
}
