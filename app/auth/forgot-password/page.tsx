import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { APP_NAME, AUTH } from "@/utils/texts";

export const metadata: Metadata = {
  title: `${AUTH.forgotPassword} | ${APP_NAME}`,
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <header className="absolute top-0 z-50 flex h-16 w-full flex-row-reverse items-center justify-between px-6 md:px-12">
        <Link href="/" className="font-display text-2xl font-bold text-primary">
          {APP_NAME}
        </Link>
      </header>

      <main className="relative z-10 flex flex-grow items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <ForgotPasswordForm />
        </div>
      </main>
    </div>
  );
}
