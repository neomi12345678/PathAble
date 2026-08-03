const EMPLOYMENT_SCOPE: Record<string, string> = {
  FULL_TIME: "משרה מלאה",
  PART_TIME: "משרה חלקית",
  CONTRACTOR: "חוזה",
  TEMPORARY: "זמני",
  INTERN: "התמחות",
  VOLUNTEER: "התנדבות",
  PER_DIEM: "פרילנס",
  OTHER: "אחר",
};

/** מקסימום גיל משרה בימים כשאין validThrough */
export const MAX_JOB_AGE_DAYS = 90;

export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+\n/g, "\n")
    .trim();
}

export interface JobPostingJson {
  title?: string;
  description?: string;
  datePosted?: string;
  validThrough?: string;
  employmentType?: string;
  baseSalary?: number;
  hiringOrganization?: { name?: string };
  jobLocation?: {
    address?:
      | { addressLocality?: string | null }
      | Array<{ addressLocality?: string | null }>;
  };
}

export function parseJobPostingJsonLd(html: string): JobPostingJson | null {
  for (const block of Array.from(
    html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
    )
  )) {
    try {
      const json = JSON.parse(block[1]) as { "@type"?: string };
      if (json["@type"] === "JobPosting") {
        return json as JobPostingJson;
      }
    } catch {
      // ignore invalid JSON-LD blocks
    }
  }
  return null;
}

/** האם המשרה עדיין פתוחה לפי JSON-LD */
export function isJobPostingActive(posting: JobPostingJson): boolean {
  if (posting.validThrough) {
    const end = new Date(posting.validThrough);
    if (!Number.isNaN(end.getTime()) && end.getTime() < Date.now()) {
      return false;
    }
  }

  if (posting.datePosted) {
    const posted = new Date(posting.datePosted);
    if (!Number.isNaN(posted.getTime())) {
      const ageDays = (Date.now() - posted.getTime()) / 86_400_000;
      if (ageDays > MAX_JOB_AGE_DAYS) return false;
    }
  }

  return true;
}

function normalizeAddresses(
  jobLocation?: JobPostingJson["jobLocation"]
): Array<{ addressLocality?: string | null }> {
  const raw = jobLocation?.address;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function inferCity(posting: JobPostingJson): string {
  const localities = normalizeAddresses(posting.jobLocation)
    .map((a) => a.addressLocality?.trim())
    .filter((v): v is string => Boolean(v));
  const unique = [...new Set(localities)];
  return unique.length > 0 ? unique.join(" · ") : "ישראל";
}

function inferWorkFromHome(city: string, description: string): boolean {
  const text = `${city} ${description}`.toLowerCase();
  return /מהבית|עבודה מהבית|remote|היברידי|hybrid|wfh/.test(text);
}

function inferSocialLevel(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  if (/מנהל|ראש צוות|מכיר|sales|לקוחות|customer/.test(text)) return "גבוה";
  if (/qa|בודק|הזנה|ארכי|כתיב|שרטוט|cad|ניתוח נתונים|data entry|תמיכה/.test(text)) {
    return "נמוך";
  }
  return "בינוני";
}

function inferSupportFeatures(description: string, workFromHome: boolean): string[] {
  const features: string[] = [];
  if (workFromHome) features.push("עבודה מהבית");
  if (/ליווי|שילוב|mentor|מנטור/.test(description)) features.push("ליווי בתעסוקה");
  if (/כתוב|מייל|slack|async|בכתב/.test(description)) features.push("משימות כתובות");
  if (/גמיש|flexible/.test(description)) features.push("גמישות בשעות");
  return features;
}

function inferDisabilityFit(
  title: string,
  description: string,
  workFromHome: boolean,
  socialLevel: string
): string[] {
  const fits = new Set<string>();
  const text = `${title} ${description}`.toLowerCase();

  if (/אוטיזם|autism|asd|רצף האוטיסט/.test(text)) fits.add("אוטיזם");
  if (/adhd|הפרעת קשב|קשב וריכוז|\bhyper\b/.test(text)) fits.add("ADHD");
  if (/חרדה חברתית|social anxiety/.test(text)) fits.add("חרדה חברתית");
  if (/לקות למידה|dyslex|דיסלק/.test(text)) fits.add("לקות למידה");
  if (/לקות שמיעה|כבד.?שמיע|hearing.?impair|\bdeaf\b|חירש/.test(text)) {
    fits.add("לקות שמיעה");
  }
  if (/לקות ראייה|עיוור|קורא מסך|low.?vision|\bblind\b/.test(text)) {
    fits.add("לקות ראייה");
  }
  if (/לקות פיזית|כיסא.?גלגל|מוגבלות פיזית|mobility|נגישות פיזית/.test(text)) {
    fits.add("לקות פיזית");
  }

  const structuredDesk =
    socialLevel === "נמוך" &&
    (workFromHome ||
      /qa|בודק|הזנ|data entry|ניתוח נתונים|frontend|פיתוח|הנהלת חשבונות|עיצוב|ux|תוכן/.test(
        text
      ));
  if (structuredDesk) {
    fits.add("אוטיזם");
    fits.add("חרדה חברתית");
    fits.add("ADHD");
  }

  if (
    socialLevel !== "גבוה" &&
    /qa|הזנ|data|ניתוח|בדיק|פיתוח|frontend|הנהלת חשבונות|ארכיון|קטלוג/.test(text)
  ) {
    fits.add("ADHD");
  }

  if (workFromHome && /כתוב|מייל|slack|async|בכתב/.test(text)) {
    fits.add("לקות שמיעה");
  }

  if (/נגיש ללקוי.?ראי|מותאם.?ראייה|קורא מסך/.test(text)) {
    fits.add("לקות ראייה");
  }

  return [...fits];
}

export function enrichDisabilityFit(
  title: string,
  description: string,
  workFromHome: boolean,
  socialLevel: string,
  existing: string[] = []
): string[] {
  return [
    ...new Set([
      ...existing,
      ...inferDisabilityFit(title, description, workFromHome, socialLevel),
    ]),
  ];
}

export interface SyncJobRow {
  slug: string;
  title: string;
  company: string;
  city: string;
  description: string;
  salary: string;
  apply_url: string;
  work_from_home: boolean;
  accessibility: boolean;
  scope: string;
  social_interaction_level: string;
  support_features: string[];
  autism_match_reason: string;
  disability_fit: string[];
  profession_id: null;
  active: boolean;
  created_at: string;
}

export function mapJobPostingToRow(
  slug: string,
  applyUrl: string,
  posting: JobPostingJson
): SyncJobRow | null {
  const title = posting.title?.trim();
  const company = posting.hiringOrganization?.name?.trim();
  const rawDescription = stripHtml(posting.description ?? "");
  const description =
    rawDescription.length >= 20
      ? rawDescription
      : `${title}. משרה ב${company}. ${rawDescription}`.trim();

  if (!slug || !title || !company || description.length < 10) return null;
  if (!isJobPostingActive(posting)) return null;

  const city = inferCity(posting);
  const workFromHome = inferWorkFromHome(city, description);
  const socialLevel = inferSocialLevel(title, description);
  const supportFeatures = inferSupportFeatures(description, workFromHome);
  const disabilityFit = inferDisabilityFit(
    title,
    description,
    workFromHome,
    socialLevel
  );
  const reason =
    description.length > 160 ? `${description.slice(0, 157)}...` : description;

  const salary =
    posting.baseSalary && posting.baseSalary > 0
      ? `${posting.baseSalary.toLocaleString("he-IL")} ₪`
      : "לא צוין";

  const scope = EMPLOYMENT_SCOPE[posting.employmentType ?? ""] ?? "משרה מלאה";

  const createdAt = posting.datePosted
    ? new Date(posting.datePosted).toISOString()
    : new Date().toISOString();

  return {
    slug,
    title,
    company,
    city,
    description,
    salary,
    apply_url: applyUrl,
    work_from_home: workFromHome,
    accessibility: true,
    scope,
    social_interaction_level: socialLevel,
    support_features: supportFeatures,
    autism_match_reason: reason,
    disability_fit: disabilityFit,
    profession_id: null,
    active: true,
    created_at: createdAt,
  };
}

/** slug בטוח מנתיב URL */
export function slugifyJobPath(prefix: string, path: string): string {
  const normalized = path
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-zA-Z0-9\u0590-\u05FF-]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
    .slice(0, 80);
  return `${prefix}-${normalized}`;
}

export const SYNCED_JOB_PREFIXES = [
  "drushim-",
  "gotfriends-",
  "alljobs-",
  "jobmaster-",
  "jobnet-",
] as const;
