import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { APP_NAME, AUTH } from "@/utils/texts";

export const metadata: Metadata = {
  title: `${AUTH.registerTitle} | ${APP_NAME}`,
  description: `הרשמה למערכת ${APP_NAME}`,
};

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-primary-container opacity-40 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-secondary-container opacity-40 blur-[100px]" />

      <header className="absolute top-0 z-50 flex h-16 w-full flex-row-reverse items-center justify-between px-6 md:px-12">
        <Link href="/" className="font-display text-2xl font-bold text-primary">
          {APP_NAME}
        </Link>
        <div className="hidden flex-row-reverse gap-3 text-sm md:flex">
          <span className="font-medium text-on-surface-variant">
            כבר יש לך חשבון?
          </span>
          <Link href="/auth/login" className="font-bold text-primary hover:underline">
            התחברות
          </Link>
        </div>
      </header>

      <main className="z-10 w-full max-w-2xl">
        <RegisterForm />
      </main>
    </div>
  );
}
