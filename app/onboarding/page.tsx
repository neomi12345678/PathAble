"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { APP_NAME } from "@/utils/texts";
import {
  AUTISM_LEVELS,
  DIAGNOSIS_OPTIONS,
  type AutismLevel,
  type UserProfilePrefs,
} from "@/lib/user-profile";

interface ProfileApiResponse {
  profile: UserProfilePrefs | null;
}

const SECTORS = [
  {
    id: "secular",
    label: "חילוני",
    icon: "groups",
    title: "כללי / חילוני",
    text: "מענה רחב ומגוון, עם דגש על שוויון הזדמנויות ומיצוי פוטנציאל מלא.",
  },
  {
    id: "religious",
    label: "דתי",
    icon: "synagogue",
    title: "דתי לאומי",
    text: "שילוב בין עולם העבודה המודרני לערכי הציונות הדתית וקהילתיות תומכת.",
  },
  {
    id: "haredi",
    label: "חרדי",
    icon: "temple_hindu",
    title: "מגזר חרדי",
    text: "הכוון תעסוקתי מותאם לאורח חיים תורני, בדגש על הפרדה ומקומות שומרי מצוות.",
  },
];

const DIAGNOSIS_META: Record<string, { icon: string; hint: string }> = {
  אוטיזם: {
    icon: "psychology",
    hint: "בשלב הבא תבחר/י גם רמת תפקוד",
  },
  ADHD: {
    icon: "bolt",
    hint: "משימות מגוונות, גמישות בשעות, סביבה דינמית",
  },
  "לקות למידה": {
    icon: "menu_book",
    hint: "הוראות כתובות, הדרכה מובנית, קצב אישי",
  },
  "חרדה חברתית": {
    icon: "self_improvement",
    hint: "עבודה מהבית, תקשורת בכתב, צוותים קטנים",
  },
  "לקות ראייה": {
    icon: "visibility",
    hint: "משרדים נגישים, תוכנה מותאמת, עבודה דיגיטלית",
  },
  "לקות שמיעה": {
    icon: "hearing",
    hint: "תקשורת ויזualית, ללא שיחות טלפון, צ'at ומייל",
  },
  "לקות פיזית": {
    icon: "accessible",
    hint: "משרדים נגישים, עבודה מהבית, התאמות פיזיות",
  },
};

const AUTISM_LEVEL_META: Record<
  AutismLevel,
  { icon: string; title: string; hint: string }
> = {
  גבוה: {
    icon: "trending_up",
    title: "תפקוד גבוה",
    hint: "מגוון מקצועות רחב, גם אינטראקיה בינונית אפשרית",
  },
  בינוני: {
    icon: "balance",
    title: "תפקוד בינוני",
    hint: "סביבה מובנית + ליווי חלקי בעבודה",
  },
  נמוך: {
    icon: "support",
    title: "תפקוד נמוך",
    hint: "ליווי מלא, משימות מוגדרות, סביבות מוגנות",
  },
};

export default function OnboardingPage() {
  const [isUpdate, setIsUpdate] = useState(false);
  const [step, setStep] = useState(1);
  const [sector, setSector] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [autismLevel, setAutismLevel] = useState<AutismLevel | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const update =
      new URLSearchParams(window.location.search).get("update") === "1";
    setIsUpdate(update);
  }, []);

  useEffect(() => {
    if (!isUpdate) return;
    fetch("/api/profile")
      .then((res) => res.json() as Promise<ProfileApiResponse>)
      .then((data) => {
        if (data.profile?.sector) {
          const match = SECTORS.find(
            (s) =>
              s.id === data.profile?.sector ||
              s.label === data.profile?.sector
          );
          if (match) setSector(match.id);
        }
        if (data.profile?.disability_type) {
          setDiagnosis(data.profile.disability_type);
        }
        if (data.profile?.autism_level) {
          setAutismLevel(data.profile.autism_level);
        }
      })
      .catch(() => undefined);
  }, [isUpdate]);

  const handleDiagnosisNext = (): void => {
    if (!diagnosis) return;
    if (diagnosis === "אוטיזם") {
      setStep(3);
      return;
    }
    void saveAndContinue(diagnosis, undefined);
  };

  const saveAndContinue = async (
    diag = diagnosis,
    level = autismLevel
  ): Promise<void> => {
    if (!sector || !diag) {
      toast.error("יש לבחור מגזר ואבחנה מדויקת");
      return;
    }
    if (diag === "אוטיזם" && !level) {
      toast.error("יש לבחור רמת תפקוד לאוטיזם");
      return;
    }

    setSaving(true);
    try {
      const sectorLabel =
        SECTORS.find((s) => s.id === sector)?.label ?? sector;
      const body: Record<string, string> = {
        sector: sectorLabel,
        disability_type: diag,
      };
      if (diag === "אוטיזם" && level) {
        body.autism_level = level;
      }

      const res = await fetch("/api/profile/onboarding", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { error?: string };

      if (!res.ok) {
        toast.error(json.error ?? "שגיאה בשמירה");
        return;
      }

      toast.success("הפרופיל נשמר — ההתאמות מחושבות לפי האבחנה שלך");
      window.location.href = isUpdate ? "/dashboard/profile" : "/dashboard/assessment";
    } catch {
      toast.error("שגיאה בשמירה, נסה שוב");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="glass-nav sticky top-0 z-50 border-none">
        <div className="mx-auto flex h-14 max-w-container-max flex-row-reverse items-center justify-between px-4 md:px-8">
          <span className="font-display text-xl font-black text-primary">
            {APP_NAME}
          </span>
          <div className="flex items-center gap-2 text-xs font-bold text-outline">
            <span className={step >= 1 ? "text-primary" : ""}>מגזר</span>
            <span>·</span>
            <span className={step >= 2 ? "text-primary" : ""}>אבחנה</span>
            {diagnosis === "אוטיזם" && (
              <>
                <span>·</span>
                <span className={step >= 3 ? "text-primary" : ""}>תפקוד</span>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-4xl flex-grow flex-col items-center px-4 py-10 md:px-8">
        {step === 1 && (
          <div className="flex w-full flex-col items-center gap-8">
            <div className="max-w-2xl space-y-2 text-center">
              <h1 className="font-display text-2xl font-black text-on-primary-fixed-variant md:text-3xl">
                באיזה מגזר את/ה?
              </h1>
              <p className="text-sm text-on-surface-variant">
                זה עוזר לנו להתאים תוכן, מקצועות ומשרות לסביבה שלך.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
              {SECTORS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSector(s.id)}
                  className={`glass-card flex flex-col items-center rounded-2xl p-6 text-center transition-all ${
                    sector === s.id
                      ? "ring-2 ring-primary/30"
                      : "hover:border-primary/20"
                  }`}
                >
                  <span className="material-symbols-outlined mb-3 text-3xl text-primary">
                    {s.icon}
                  </span>
                  <h3 className="mb-2 font-display text-base font-black">
                    {s.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-on-surface-variant">
                    {s.text}
                  </p>
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={!sector}
              onClick={() => setStep(2)}
              className="rounded-xl bg-primary px-8 py-2.5 text-sm font-black text-white shadow-md transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              המשך לשלב הבא
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex w-full flex-col items-center gap-6">
            <div className="max-w-2xl space-y-2 text-center">
              <span className="inline-block rounded-full bg-secondary-container/30 px-3 py-0.5 text-xs font-black text-secondary">
                שדה חובה *
              </span>
              <h1 className="font-display text-2xl font-black md:text-3xl">
                מה האבחנה הרפואית שלך?
              </h1>
              <p className="text-sm text-on-surface-variant">
                ההתאמה למקצועות ולמשרות מחושבת לפי האבחנה המדויקת.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              {DIAGNOSIS_OPTIONS.map((d) => {
                const meta = DIAGNOSIS_META[d];
                const selected = diagnosis === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDiagnosis(d);
                      if (d !== "אוטיזם") setAutismLevel(null);
                    }}
                    className={`flex flex-col items-start gap-1.5 rounded-2xl border-2 p-4 text-right transition-all ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 bg-white hover:border-primary/40"
                    }`}
                  >
                    <div className="flex w-full flex-row-reverse items-center justify-between">
                      <span className="font-display text-base font-black">
                        {d}
                      </span>
                      <span
                        className={`material-symbols-outlined text-2xl ${selected ? "text-primary" : "text-outline"}`}
                      >
                        {meta.icon}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {meta.hint}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row-reverse">
              <button
                type="button"
                disabled={!diagnosis || saving}
                onClick={handleDiagnosisNext}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-black text-white shadow-md transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving
                  ? "שומר..."
                  : diagnosis === "אוטיזם"
                    ? "המשך לרמת תפקוד"
                    : "סיום והתחלת התאמה אישית"}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-outline-variant px-6 py-2.5 text-sm font-bold text-on-surface-variant"
              >
                חזרה
              </button>
            </div>
          </div>
        )}

        {step === 3 && diagnosis === "אוטיזם" && (
          <div className="flex w-full flex-col items-center gap-6">
            <div className="max-w-2xl space-y-2 text-center">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-black text-primary">
                שדה חובה לאוטיזם *
              </span>
              <h1 className="font-display text-2xl font-black md:text-3xl">
                מה רמת התפקוד שלך?
              </h1>
              <p className="text-sm text-on-surface-variant">
                רמות תפקוד שונות מצביעות על צרכים שונים בעבודה — נתאים מקצועות
                ומשרות בהתאם.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
              {AUTISM_LEVELS.map((level) => {
                const meta = AUTISM_LEVEL_META[level];
                const selected = autismLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setAutismLevel(level)}
                    className={`flex flex-col items-start gap-1.5 rounded-2xl border-2 p-4 text-right transition-all ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 bg-white hover:border-primary/40"
                    }`}
                  >
                    <div className="flex w-full flex-row-reverse items-center justify-between">
                      <span className="font-display text-base font-black">
                        {meta.title}
                      </span>
                      <span
                        className={`material-symbols-outlined text-2xl ${selected ? "text-primary" : "text-outline"}`}
                      >
                        {meta.icon}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {meta.hint}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row-reverse">
              <button
                type="button"
                disabled={!autismLevel || saving}
                onClick={() => void saveAndContinue()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-black text-white shadow-md transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? "שומר..." : "סיום והתחלת התאמה אישית"}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-xl border border-outline-variant px-6 py-2.5 text-sm font-bold text-on-surface-variant"
              >
                חזרה
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-haredi-primary px-4 py-5 text-white md:px-8">
        <div className="mx-auto flex max-w-container-max flex-col items-center justify-between gap-1 md:flex-row-reverse">
          <span className="font-display text-sm font-black">{APP_NAME}</span>
          <p className="text-xs text-white/60">
            המידע הרפואי משמש רק להתאמת מקצועות ומשרות — לא משותף עם מעסיקים.
          </p>
        </div>
      </footer>
    </div>
  );
}
