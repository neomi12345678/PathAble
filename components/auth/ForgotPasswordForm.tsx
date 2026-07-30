"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { AUTH, COMMON } from "@/utils/texts";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(json.error ?? COMMON.genericError);
        return;
      }

      setSent(true);
      toast.success("נשלח קישור לאיפוס סיסמה");
    } catch {
      setError(COMMON.genericError);
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center shadow-premium">
        <span className="material-symbols-outlined mb-4 text-5xl text-primary">
          mark_email_read
        </span>
        <h2 className="font-display text-xl font-bold text-on-surface">
          בדוק/י את תיבת האימייל
        </h2>
        <p className="mt-3 text-on-surface-variant">
          שלחנו קישור לאיפוס סיסמה ל-{email}
        </p>
        <Link
          href="/auth/login"
          className="mt-6 inline-block font-bold text-primary hover:underline"
        >
          חזרה להתחברות
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-8 shadow-premium md:p-10">
      <div className="mb-6 text-center">
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          {AUTH.forgotPassword}
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          הזן/י את כתובת האימייל ונשלח קישור לאיפוס
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block px-1 text-sm font-semibold text-on-surface-variant"
          >
            {AUTH.emailLabel}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-outline-variant/40 bg-white/60 px-4 py-3 text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-error-container/20 px-4 py-3 text-sm font-medium text-error">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-secondary-fixed text-lg font-bold text-on-secondary-fixed shadow-md transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? COMMON.loading : COMMON.send}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-on-surface-variant">
        <Link href="/auth/login" className="font-bold text-primary hover:underline">
          חזרה להתחברות
        </Link>
      </p>
    </div>
  );
}
