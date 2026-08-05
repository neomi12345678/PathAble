"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { AUTH, COMMON } from "@/utils/texts";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  useEffect(() => {
    if (searchParams.get("error") === "oauth") {
      setError(AUTH.oauthError);
    }
    if (searchParams.get("error") === "confirm") {
      setError(
        "קישור האימות לא עבד. נסי להתחבר ישירות עם האימייל והסיסמה."
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? COMMON.genericError);
        return;
      }

      toast.success(AUTH.loginSuccess);
      router.push(redirect);
      router.refresh();
    } catch {
      setError(COMMON.genericError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-8 shadow-premium md:p-10">
      <div className="mb-6 text-center">
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          כניסה למערכת
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block px-1 text-sm font-semibold text-on-surface-variant"
          >
            כתובת אימייל
          </label>
          <div className="group relative">
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary">
              mail
            </span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-3 pr-12 pl-4 text-base outline-none transition-all placeholder:text-outline/50 focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-on-surface-variant"
            >
              סיסמה
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-sm font-bold text-primary transition-all hover:text-on-primary-container"
            >
              שכחת סיסמה?
            </Link>
          </div>
          <div className="group relative">
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary">
              lock
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-3 pr-12 pl-12 text-base outline-none transition-all placeholder:text-outline/50 focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-primary"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 px-1">
          <input
            id="remember"
            type="checkbox"
            className="h-5 w-5 cursor-pointer rounded border-outline-variant text-primary focus:ring-primary/20"
          />
          <label
            htmlFor="remember"
            className="cursor-pointer select-none text-base text-on-surface-variant"
          >
            זכור אותי במכשיר זה
          </label>
        </div>

        {error && (
          <p className="rounded-xl bg-error-container px-4 py-2 text-sm text-on-error-container">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-secondary-fixed text-[20px] font-bold text-on-secondary-fixed shadow-md transition-all hover:scale-[1.01] hover:bg-secondary-fixed-dim hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{isLoading ? COMMON.loading : AUTH.loginButton}</span>
          <span className="material-symbols-outlined">login</span>
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-outline-variant/40" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white/60 px-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant backdrop-blur-md">
            {AUTH.orContinueWith}
          </span>
        </div>
      </div>

      <GoogleSignInButton redirectTo={redirect} />

      <p className="mt-8 text-center text-base text-on-surface-variant">
        {AUTH.noAccount}{" "}
        <Link
          href="/auth/register"
          className="font-bold text-primary underline-offset-4 hover:underline"
        >
          להרשמה חינם
        </Link>
      </p>
    </div>
  );
}
