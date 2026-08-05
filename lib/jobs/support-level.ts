/** רמת מבניות/תמיכה בתפקיד — מנותח מטקסט המשרה בלבד */
export const SUPPORT_LEVELS = [
  "structured",
  "moderate",
  "independent",
] as const;

export type SupportLevel = (typeof SUPPORT_LEVELS)[number];

export const SUPPORT_LEVEL_LABELS: Record<SupportLevel, string> = {
  structured: "תפקיד מובנה",
  moderate: "בינוני",
  independent: "דורש עצמאות",
};

export const SUPPORT_LEVEL_HINTS: Record<SupportLevel, string> = {
  structured: "סימנים לליווי, נהלים ברורים או ניסיון נמוך",
  moderate: "שילוב של הנחיה ועבודה עצמאית",
  independent: "סימנים ליוזמה, עצמאות או ניסיון בכיר",
};

export const SUPPORT_LEVEL_TOOLTIP =
  "הסיווג מבוסס על ניתוח טקסט המשרה (מבנה, ליווי, ניסיון) — לא ערובה מוחלטת.";

const STRUCTURED_PATTERNS: RegExp[] = [
  /הדרכה צמודה/u,
  /ליווי אישי/u,
  /ליווי צמוד/u,
  /נהלים ברורים/u,
  /משימות מוגדרות/u,
  /משימות חוזרות/u,
  /עבודה לפי checklist/u,
  /\bchecklist\b/i,
  /צוות תומך/u,
  /onboarding מובנה/u,
  /structured onboarding/i,
  /הכשרה מלאה/u,
  /ליווי בתהליך הקליטה/u,
  /תוכנית הכשרה/u,
  /לא נדרש ניסיון/u,
  /ללא ניסיון/u,
  /no experience required/i,
  /entry level/i,
  /junior\b/i,
  /0-1\s*שנ/u,
  /שנה ראשונה/u,
  /graduate program/i,
  /משימות ברורות/u,
  /תיאור תפקיד מפורט/u,
];

const INDEPENDENT_PATTERNS: RegExp[] = [
  /עבודה עצמאית/u,
  /יוזמה אישית/u,
  /ריבוי משימות/u,
  /multitask/i,
  /סביבה דינמית/u,
  /dynamic environment/i,
  /ניהול עצמי/u,
  /self.?managed/i,
  /אחריות רחבה/u,
  /ownership/i,
  /end to end/i,
  /ראש צוות/u,
  /team lead/i,
  /מנהל\b/u,
  /\bmanager\b/i,
  /director\b/i,
  /senior\b/i,
  /3\+?\s*שנ/u,
  /3-5\s*שנ/u,
  /5\+?\s*שנ/u,
  /ניסיון של 3/u,
  /ניסיון של 4/u,
  /ניסיון של 5/u,
  /years of experience/i,
  /עצמאות מלאה/u,
  /קבלת החלטות\b/u,
];

const MODERATE_EXPERIENCE_PATTERNS: RegExp[] = [
  /1-3\s*שנ/u,
  /2-3\s*שנ/u,
  /שנה-שנתיים/u,
  /1\+?\s*שנ/u,
  /2\+?\s*שנ/u,
  /mid.?level/i,
];

const TASK_LIST_PATTERNS: RegExp[] = [
  /^[\s•\-*\d]+[\).]/m,
  /תחומי אחריות/u,
  /אחריות כוללת/u,
  /התפקיד כולל/u,
  /דרישות:/u,
  /requirements:/i,
];

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.reduce((n, p) => (p.test(text) ? n + 1 : n), 0);
}

export function isSupportLevel(value: string): value is SupportLevel {
  return (SUPPORT_LEVELS as readonly string[]).includes(value);
}

/**
 * Heuristic: structured / moderate / independent
 * מבוסס על מילות מפתח, ניסיון נדרש ומידת פירוט — לא על אבחנה.
 */
export function inferSupportLevel(title: string, description: string): SupportLevel {
  const text = `${title}\n${description}`;
  const lower = text.toLowerCase();

  let structured = countMatches(text, STRUCTURED_PATTERNS);
  let independent = countMatches(text, INDEPENDENT_PATTERNS);

  if (countMatches(text, TASK_LIST_PATTERNS) >= 2) {
    structured += 2;
  } else if (countMatches(text, TASK_LIST_PATTERNS) === 1) {
    structured += 1;
  }

  if (countMatches(text, MODERATE_EXPERIENCE_PATTERNS) >= 1) {
    structured += 0;
    independent += 0;
  }

  if (/לא נדרש ניסיון|ללא ניסיון|no experience|entry level|junior|0-1\s*שנ/i.test(lower)) {
    structured += 2;
  }

  if (/3\+|3-5|5\+|senior|lead|manager|מנהל|ראש צוות|director/i.test(lower)) {
    independent += 2;
  }

  if (description.trim().length > 0 && description.trim().length < 180) {
    independent += 1;
  }

  if (structured >= independent + 2) return "structured";
  if (independent >= structured + 2) return "independent";
  return "moderate";
}

export function getSupportLevelLabel(level: SupportLevel | string): string {
  if (isSupportLevel(level)) return SUPPORT_LEVEL_LABELS[level];
  return SUPPORT_LEVEL_LABELS.moderate;
}

export function supportLevelBadgeClass(level: SupportLevel | string): string {
  switch (level) {
    case "structured":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "independent":
      return "bg-sky-50 text-sky-800 border-sky-200";
    default:
      return "bg-amber-50 text-amber-800 border-amber-200";
  }
}

export function supportLevelEmoji(level: SupportLevel | string): string {
  switch (level) {
    case "structured":
      return "🟢";
    case "independent":
      return "🔵";
    default:
      return "🟡";
  }
}
