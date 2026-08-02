import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ConfirmEmailHandler } from "@/components/auth/ConfirmEmailHandler";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { APP_NAME } from "@/utils/texts";

export const metadata: Metadata = {
  title: `אימות אימייל | ${APP_NAME}`,
  description: "אימות כתובת האימייל שלך",
};

export default function ConfirmEmailPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute right-[-10%] top-[-15%] h-[700px] w-[700px] animate-pulse-slow rounded-full bg-[radial-gradient(circle,#0ea5e9,transparent_70%)] opacity-25 blur-[140px]" />

      <header className="absolute top-0 z-50 flex h-16 w-full flex-row-reverse items-center justify-between px-6 md:px-12">
        <Link href="/" className="font-display text-2xl font-bold text-primary">
          {APP_NAME}
        </Link>
      </header>

      <main className="relative z-10 flex flex-grow items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <Suspense fallback={<SkeletonCard />}>
            <ConfirmEmailHandler />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
