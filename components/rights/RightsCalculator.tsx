"use client";

import { useState } from "react";

type EmploymentType = "monthly" | "hourly" | "freelance";

const TENURE_OPTIONS = [
  { id: "lt1", label: "פחות משנה", years: 0.5 },
  { id: "1-3", label: "1-3 שנים", years: 2 },
  { id: "3-5", label: "3-5 שנים", years: 4 },
  { id: "5+", label: "מעל 5 שנים", years: 6 },
] as const;

const CONVALESCENCE_RATE = 418; // תעריף יום הבראה במגזר הפרטי (הערכה)

interface ResultItem {
  icon: string;
  title: string;
  value: string;
  note: string;
}

/** ימי חופשה שנתיים לפי חוק חופשה שנתית (שבוע עבודה של 5 ימים) */
function vacationDays(years: number): number {
  if (years < 6) return 12;
  if (years < 7) return 14;
  if (years < 8) return 15;
  return Math.min(20, 15 + Math.floor(years - 7));
}

/** ימי הבראה לפי ותק (מגזר פרטי) */
function convalescenceDays(years: number): number {
  if (years < 1) return 0;
  if (years < 2) return 5;
  if (years < 4) return 6;
  if (years < 11) return 7;
  return 8;
}

function noticeDays(years: number): number {
  if (years >= 1) return 30;
  const months = Math.round(years * 12);
  if (months <= 6) return months;
  return 6 + (months - 6) * 2.5;
}

function calculate(
  years: number,
  type: EmploymentType,
  percent: number,
  salary: number
): ResultItem[] {
  if (type === "freelance") {
    return [
      {
        icon: "info",
        title: "עצמאי/ת (חשבונית)",
        value: "רוב זכויות העובדים לא חלות",
        note: "חופשה, מחלה, הבראה ופיצויים חלים על שכירים בלבד. אם בפועל מתקיימים יחסי עובד-מעביד — ייתכן שמגיעות לך זכויות של שכיר/ה. מומלץ להתייעץ עם גוף מסייע.",
      },
      {
        icon: "savings",
        title: "פנסיה לעצמאים",
        value: "חובת הפקדה עצמאית",
        note: "מאז 2017 עצמאים מחויבים להפקיד לפנסיה לפי מדרגות הכנסה.",
      },
    ];
  }

  const scale = percent / 100;
  const results: ResultItem[] = [];

  results.push({
    icon: "beach_access",
    title: "ימי חופשה בשנה",
    value: `${Math.round(vacationDays(years) * scale)} ימים`,
    note: "לפי חוק חופשה שנתית, שבוע עבודה של 5 ימים, יחסית להיקף המשרה.",
  });

  results.push({
    icon: "sick",
    title: "צבירת ימי מחלה",
    value: `${(1.5 * scale).toFixed(1)} ימים בחודש`,
    note: "צבירה של עד 90 ימים. יום ראשון ללא תשלום, ימים 2-3 בשכר חלקי (50%), מהיום הרביעי שכר מלא.",
  });

  const convDays = convalescenceDays(years);
  results.push({
    icon: "spa",
    title: "דמי הבראה",
    value:
      convDays === 0
        ? "לאחר שנת עבודה ראשונה"
        : `${convDays} ימים ≈ ₪${Math.round(convDays * CONVALESCENCE_RATE * scale).toLocaleString()}`,
    note:
      convDays === 0
        ? "הזכאות מתחילה לאחר השלמת שנת עבודה מלאה."
        : `לפי תעריף של כ-₪${CONVALESCENCE_RATE} ליום במגזר הפרטי, יחסית להיקף המשרה.`,
  });

  if (salary > 0) {
    results.push({
      icon: "account_balance_wallet",
      title: "פיצויי פיטורים (במקרה של פיטורים)",
      value: `≈ ₪${Math.round(salary * years).toLocaleString()}`,
      note: "שכר חודשי אחד לכל שנת ותק. חלק מהסכום נצבר בקרן הפנסיה (סעיף 14).",
    });
    results.push({
      icon: "savings",
      title: "הפרשות פנסיה חודשיות",
      value: `≈ ₪${Math.round(salary * 0.125).toLocaleString()} מהמעסיק`,
      note: "6.5% תגמולים + 6% פיצויים מהמעסיק, ובנוסף 6% משכר העובד/ת.",
    });
  } else {
    results.push({
      icon: "account_balance_wallet",
      title: "פיצויים ופנסיה",
      value: "הזן שכר חודשי לחישוב",
      note: "הוסיפו שכר חודשי ברוטו כדי לקבל הערכת פיצויים והפרשות פנסיה.",
    });
  }

  const notice = noticeDays(years);
  results.push({
    icon: "schedule",
    title: "הודעה מוקדמת",
    value: notice >= 30 ? "חודש ימים" : `כ-${Math.round(notice)} ימים`,
    note: "תקופת ההודעה המוקדמת שהמעסיק חייב לתת לפני פיטורים (לשכיר/ה חודשי/ת).",
  });

  return results;
}

export function RightsCalculator() {
  const [tenureId, setTenureId] = useState<string>("lt1");
  const [type, setType] = useState<EmploymentType>("monthly");
  const [percent, setPercent] = useState("100");
  const [salary, setSalary] = useState("");
  const [results, setResults] = useState<ResultItem[] | null>(null);

  const handleCalculate = (): void => {
    const tenure = TENURE_OPTIONS.find((t) => t.id === tenureId);
    const pct = Math.min(100, Math.max(1, Number(percent) || 100));
    const sal = Math.max(0, Number(salary) || 0);
    setResults(calculate(tenure?.years ?? 0.5, type, pct, sal));
  };

  return (
    <section
      id="calculator"
      className="glass-card rounded-3xl border-primary-container/20 p-10"
    >
      <div className="mb-10 text-center">
        <h2 className="mb-3 font-display text-3xl font-bold">
          מחשבון זכויות אישי
        </h2>
        <p className="text-on-surface-variant">
          הזן את נתוניך וקבל הערכה מיידית של הזכויות המגיעות לך
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-2">
          <label
            htmlFor="calc-tenure"
            className="block px-1 text-sm font-bold text-on-surface-variant"
          >
            ותק במקום העבודה
          </label>
          <select
            id="calc-tenure"
            value={tenureId}
            onChange={(e) => setTenureId(e.target.value)}
            className="h-12 w-full rounded-xl border border-outline-variant bg-white/50 px-3 focus:border-primary focus:ring-primary"
          >
            {TENURE_OPTIONS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="calc-type"
            className="block px-1 text-sm font-bold text-on-surface-variant"
          >
            סוג העסקה
          </label>
          <select
            id="calc-type"
            value={type}
            onChange={(e) => setType(e.target.value as EmploymentType)}
            className="h-12 w-full rounded-xl border border-outline-variant bg-white/50 px-3 focus:border-primary focus:ring-primary"
          >
            <option value="monthly">שכיר חודשי</option>
            <option value="hourly">שכיר שעתי</option>
            <option value="freelance">פרילנסר (חשבונית)</option>
          </select>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="calc-percent"
            className="block px-1 text-sm font-bold text-on-surface-variant"
          >
            היקף משרה (%)
          </label>
          <input
            id="calc-percent"
            type="number"
            min={1}
            max={100}
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            placeholder="למשל: 100"
            className="h-12 w-full rounded-xl border border-outline-variant bg-white/50 px-3 focus:border-primary focus:ring-primary"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="calc-salary"
            className="block px-1 text-sm font-bold text-on-surface-variant"
          >
            שכר חודשי ברוטו (אופציונלי)
          </label>
          <input
            id="calc-salary"
            type="number"
            min={0}
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="למשל: 8000"
            className="h-12 w-full rounded-xl border border-outline-variant bg-white/50 px-3 focus:border-primary focus:ring-primary"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleCalculate}
            className="h-12 w-full rounded-xl bg-primary font-bold text-on-primary shadow-lg shadow-primary/30 transition-all hover:brightness-110 active:scale-95"
          >
            חשב זכויות
          </button>
        </div>
      </div>

      {results && (
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => (
            <div
              key={r.title}
              className="flex flex-col rounded-2xl border border-outline-variant/40 bg-white/70 p-5 text-right"
            >
              <div className="mb-3 flex flex-row-reverse items-center justify-end gap-3">
                <h3 className="font-display text-base font-bold text-on-surface">
                  {r.title}
                </h3>
                <span className="material-symbols-outlined rounded-xl bg-primary/10 p-2 text-xl text-primary">
                  {r.icon}
                </span>
              </div>
              <p className="mb-2 text-lg font-black text-primary">{r.value}</p>
              <p className="text-xs leading-relaxed text-on-surface-variant">
                {r.note}
              </p>
            </div>
          ))}
          <p className="text-xs text-on-surface-variant md:col-span-2 lg:col-span-3">
            * הערכה כללית בלבד לפי חוקי העבודה בישראל — אינה מהווה ייעוץ משפטי.
            הסכומים והתעריפים עשויים להשתנות.
          </p>
        </div>
      )}
    </section>
  );
}
