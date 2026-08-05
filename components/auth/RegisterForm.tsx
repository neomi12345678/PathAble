"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { registerInterestOptionsForUi } from "@/lib/professions/profession-interests";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { APP_NAME, AUTH, COMMON } from "@/utils/texts";

const STEPS = [
  { id: 1, label: "פרטים אישיים" },
  { id: 2, label: "העדפות" },
  { id: 3, label: "סיום" },
];

const INTERESTS = registerInterestOptionsForUi();

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (id: string): void => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!terms) {
      setError("יש לאשר את תנאי השימוש");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password, fullName, interests }),
      });

      const json = (await res.json()) as {
        error?: string;
        data?: { welcomeEmailSent?: boolean };
      };

      if (!res.ok) {
        setError(json.error ?? COMMON.genericError);
        return;
      }

      toast.success(
        json.data?.welcomeEmailSent
          ? "נרשמת בהצלחה! שלחנו אליך מייל ברוכים הבאים."
          : "נרשמת בהצלחה! (מייל ברוכים הבאים לא נשלח — בדקי ספאם או הרשמי עם אימייל חשבון Resend)"
      );
      router.push("/onboarding");
      router.refresh();
    } catch {
      setError(COMMON.genericError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-8 shadow-premium md:p-12">
      <nav className="mb-12 flex flex-row-reverse items-center justify-between">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex flex-1 items-center">
            <div className="flex flex-1 flex-col items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all duration-300 ${
                  step >= s.id
                    ? "bg-primary text-on-primary"
                    : "bg-surface-variant text-on-surface-variant"
                }`}
              >
                {step > s.id ? (
                  <span className="material-symbols-outlined text-[20px]">
                    check
                  </span>
                ) : (
                  s.id
                )}
              </div>
              <span
                className={`text-sm font-bold ${
                  step >= s.id ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="mb-6 h-[2px] flex-1 bg-outline-variant" />
            )}
          </div>
        ))}
      </nav>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <section className="animate-fade-up">
            <div className="mb-8">
              <h1 className="mb-2 font-display text-3xl font-semibold text-primary">
                ברוכים הבאים
              </h1>
              <p className="text-lg text-on-surface-variant">
                בואו נתחיל עם הפרטים הבסיסיים כדי להכיר אתכם טוב יותר.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block font-bold text-on-surface">שם מלא</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ישראל ישראלי"
                  className="w-full rounded-lg border border-outline-variant bg-white/50 p-4 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-bold text-on-surface">
                  דואר אלקטרוני
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-outline-variant bg-white/50 p-4 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block font-bold text-on-surface">סיסמה</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-outline-variant bg-white/50 p-4 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label="הצג סיסמה"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
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
            <GoogleSignInButton redirectTo="/onboarding" />
            <button
              type="button"
              onClick={() => setStep(2)}
              className="mt-10 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-l from-primary to-primary-container py-4 font-bold text-on-primary shadow-lg transition-all hover:scale-[1.02] active:scale-95"
            >
              <span>המשך לשלב הבא</span>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="animate-fade-up">
            <div className="mb-8">
              <h2 className="mb-2 font-display text-3xl font-semibold text-primary">
                מה מעניין אתכם?
              </h2>
              <p className="text-lg text-on-surface-variant">
                בחרו את התחומים שתרצו להתמקד בהם במסלול הקריירה שלכם.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {INTERESTS.map((it) => {
                const selected = interests.includes(it.id);
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => toggleInterest(it.id)}
                    className={`rounded-lg border-2 p-6 text-center transition-all ${
                      selected
                        ? "border-primary bg-primary-container/10"
                        : "border-outline-variant bg-white/30 hover:bg-white/60"
                    }`}
                  >
                    <span className="material-symbols-outlined mb-3 text-4xl text-primary">
                      {it.icon}
                    </span>
                    <div className="font-bold text-on-surface">{it.label}</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-10 flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-surface-variant/50 py-4 font-bold text-on-surface-variant transition-all hover:bg-surface-variant"
              >
                <span className="material-symbols-outlined">arrow_forward</span>
                <span>חזור</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-gradient-to-l from-primary to-primary-container py-4 font-bold text-on-primary shadow-lg transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>המשך לאישור</span>
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="animate-fade-up">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary-container shadow-xl shadow-secondary/20">
                <span className="material-symbols-outlined icon-fill text-4xl text-on-secondary-fixed-variant">
                  verified
                </span>
              </div>
              <h2 className="mb-2 font-display text-3xl font-semibold text-primary">
                כמעט שם!
              </h2>
              <p className="text-lg text-on-surface-variant">
                יש לאשר את תנאי השימוש כדי להצטרף לקהילה המקצועית שלנו.
              </p>
            </div>
            <div className="space-y-4 rounded-lg border border-outline-variant bg-white/40 p-6">
              <label className="flex cursor-pointer items-start gap-4">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-outline text-primary focus:ring-primary"
                />
                <span className="leading-relaxed text-on-surface-variant">
                  אני מאשר/ת את{" "}
                  <Link href="/terms" className="font-bold text-primary hover:underline">
                    תנאי השימוש
                  </Link>{" "}
                  ו
                  <Link href="/privacy" className="font-bold text-primary hover:underline">
                    מדיניות הפרטיות
                  </Link>{" "}
                  של {APP_NAME}. אני מבין/ה שהמידע שלי יישמר בצורה מאובטחת.
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-4">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-1 h-5 w-5 rounded border-outline text-primary focus:ring-primary"
                />
                <span className="leading-relaxed text-on-surface-variant">
                  אשמח לקבל עדכונים על משרות חדשות, קורסים והזדמנויות מקצועיות.
                </span>
              </label>
            </div>

            {error && (
              <p className="mt-4 rounded-xl bg-error-container px-4 py-2 text-sm text-on-error-container">
                {error}
              </p>
            )}

            <div className="mt-10 flex gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-surface-variant/50 py-4 font-bold text-on-surface-variant transition-all hover:bg-surface-variant"
              >
                <span className="material-symbols-outlined">arrow_forward</span>
                <span>חזור</span>
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-secondary py-4 font-bold text-on-secondary shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{isLoading ? COMMON.loading : "סיום והרשמה"}</span>
                <span className="material-symbols-outlined icon-fill">
                  rocket_launch
                </span>
              </button>
            </div>
          </section>
        )}
      </form>
    </div>
  );
}
