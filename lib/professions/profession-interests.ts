import type { Profession } from "@/types";
import type { JobCategoryId } from "@/lib/jobs/job-categories";

export interface ProfessionInterestOption {
  id: string;
  label: string;
  icon: string;
  categories: JobCategoryId[];
  keywords: string[];
}

/** תחומי עניין — ממופים לקטגוריות מקצועות + מילות מפתח */
export const PROFESSION_INTEREST_OPTIONS: ProfessionInterestOption[] = [
  {
    id: "tech",
    label: "טכנולוגיה ופיתוח",
    icon: "code",
    categories: ["tech"],
    keywords: ["תוכנה", "פיתוח", "qa", "data", "סייבר"],
  },
  {
    id: "finance",
    label: "כספים, חשבונאות וייעוץ מס",
    icon: "account_balance",
    categories: ["finance"],
    keywords: ["מס", "חשבונ", "כספים", "ייעוץ מס", "ביקורת", "שכר"],
  },
  {
    id: "design",
    label: "עיצוב וגרפיקה",
    icon: "palette",
    categories: ["design"],
    keywords: ["עיצוב", "גרפיק", "ux", "ui"],
  },
  {
    id: "marketing",
    label: "שיווק ודיגיטל",
    icon: "trending_up",
    categories: ["marketing"],
    keywords: ["שיווק", "דיגיטל", "תוכן", "seo"],
  },
  {
    id: "education",
    label: "חינוך והדרכה",
    icon: "school",
    categories: ["education"],
    keywords: ["חינוך", "הדרכ", "לימוד", "סייע"],
  },
  {
    id: "health",
    label: "בריאות ורפואה",
    icon: "medical_services",
    categories: ["health"],
    keywords: ["רפוא", "סיעוד", "בריאות"],
  },
  {
    id: "legal",
    label: "משפטים",
    icon: "gavel",
    categories: ["legal"],
    keywords: ["משפט", "עורך דין", "paralegal"],
  },
  {
    id: "support",
    label: "שירות ותמיכה",
    icon: "support_agent",
    categories: ["support", "hr_admin"],
    keywords: ["שירות", "תמיכ", "לקוחות", "מזכיר"],
  },
];

const LEGACY_INTEREST_TO_CATEGORIES: Record<string, JobCategoryId[]> = {
  dev: ["tech"],
  ai: ["tech"],
  coding: ["tech"],
  product: ["tech", "marketing"],
  design: ["design"],
  marketing: ["marketing"],
  accessibility: ["design", "support"],
};

const ALL_INTEREST_IDS = new Set([
  ...PROFESSION_INTEREST_OPTIONS.map((o) => o.id),
  ...Object.keys(LEGACY_INTEREST_TO_CATEGORIES),
]);

export function isValidProfessionInterestId(id: string): boolean {
  return ALL_INTEREST_IDS.has(id);
}

export function getProfessionInterestLabel(id: string): string {
  return (
    PROFESSION_INTEREST_OPTIONS.find((o) => o.id === id)?.label ?? id
  );
}

export function interestIdsToCategories(ids: string[]): JobCategoryId[] {
  const categories = new Set<JobCategoryId>();
  for (const id of ids) {
    const option = PROFESSION_INTEREST_OPTIONS.find((o) => o.id === id);
    if (option) {
      for (const cat of option.categories) categories.add(cat);
      continue;
    }
    const legacy = LEGACY_INTEREST_TO_CATEGORIES[id];
    if (legacy) {
      for (const cat of legacy) categories.add(cat);
    }
  }
  return [...categories];
}

function collectKeywords(ids: string[]): string[] {
  const keywords = new Set<string>();
  for (const id of ids) {
    const option = PROFESSION_INTEREST_OPTIONS.find((o) => o.id === id);
    if (option) {
      for (const kw of option.keywords) keywords.add(kw.toLowerCase());
    }
  }
  return [...keywords];
}

export function professionMatchesUserInterests(
  profession: Profession,
  interestIds: string[]
): boolean {
  if (interestIds.length === 0) return true;

  const categories = interestIdsToCategories(interestIds);
  if (
    categories.length > 0 &&
    categories.includes(profession.category as JobCategoryId)
  ) {
    return true;
  }

  const keywords = collectKeywords(interestIds);
  if (keywords.length === 0) return false;

  const haystack =
    `${profession.name} ${profession.description} ${profession.skills.join(" ")}`.toLowerCase();
  return keywords.some((kw) => haystack.includes(kw));
}

export function registerInterestOptionsForUi(): Array<{
  id: string;
  label: string;
  icon: string;
}> {
  return PROFESSION_INTEREST_OPTIONS.map(({ id, label, icon }) => ({
    id,
    label,
    icon,
  }));
}

export function profileInterestOptionsForUi(
  checkedIds: string[]
): Array<{ id: string; label: string; checked: boolean }> {
  const checked = new Set(checkedIds);
  return PROFESSION_INTEREST_OPTIONS.map(({ id, label }) => ({
    id,
    label,
    checked: checked.has(id),
  }));
}
