import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { APP_NAME, AUTH, FOOTER } from "@/utils/texts";
import { getRegisteredUserCount } from "@/lib/data/admin";
import { IMAGES } from "@/lib/assets/images";

export const metadata: Metadata = {
  title: `${AUTH.loginTitle} | ${APP_NAME}`,
  description: `התחברות למערכת ${APP_NAME}`,
};

export default async function LoginPage() {
  const userCount = await getRegisteredUserCount();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute right-[-10%] top-[-15%] h-[700px] w-[700px] animate-pulse-slow rounded-full bg-[radial-gradient(circle,#0ea5e9,transparent_70%)] opacity-25 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-15%] left-[-10%] h-[700px] w-[700px] animate-pulse-slow rounded-full bg-[radial-gradient(circle,#f9bd22,transparent_70%)] opacity-25 blur-[140px]" />

      <header className="absolute top-0 z-50 flex h-16 w-full flex-row-reverse items-center justify-between px-6 md:px-12">
        <Link href="/" className="font-display text-2xl font-bold text-primary">
          {APP_NAME}
        </Link>
        <div className="hidden flex-row-reverse gap-3 text-sm md:flex">
          <span className="font-medium text-on-surface-variant">
            עדיין אין לך חשבון?
          </span>
          <Link href="/auth/register" className="font-bold text-primary hover:underline">
            הרשמה
          </Link>
        </div>
        <Link
          href="/auth/register"
          className="text-xs font-bold text-primary md:hidden"
        >
          הרשמה
        </Link>
      </header>

      <main className="relative z-10 flex flex-grow items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-primary">
              {APP_NAME}
            </h1>
            <p className="mt-2 text-sm font-medium text-on-surface-variant">
              הכוונה תעסוקתית מותאמת אישית
            </p>
          </div>
          <Suspense fallback={<SkeletonCard />}>
            <LoginForm />
          </Suspense>
        </div>

        <div className="absolute left-12 top-1/2 hidden w-1/3 max-w-lg -translate-y-1/2 lg:block">
          <div className="relative aspect-square">
            <div
              className="h-full w-full rotate-3 rounded-3xl bg-cover bg-center shadow-2xl transition-transform duration-700 hover:rotate-0"
              style={{ backgroundImage: `url('${IMAGES.loginIllustration}')` }}
            />
            <div className="glass-card absolute -bottom-6 -right-6 max-w-xs -rotate-3 rounded-2xl border-primary/10 p-6 shadow-premium">
              <div className="mb-3 flex items-center gap-4">
                <span className="material-symbols-outlined icon-fill rounded-full bg-primary-container p-2 text-on-primary-container shadow-sm">
                  trending_up
                </span>
                <h4 className="text-sm font-extrabold uppercase tracking-wide text-on-surface">
                  צמיחה אישית
                </h4>
              </div>
              <p className="leading-relaxed text-on-surface-variant">
                {userCount > 0 ? (
                  <>
                    <span className="font-black text-primary">{userCount}</span>{" "}
                    משתמשים רשומים ב-{APP_NAME} — {FOOTER.tagline}
                  </>
                ) : (
                  FOOTER.tagline
                )}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
