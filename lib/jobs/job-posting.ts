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
  baseSalary?: number | string;
  url?: string;
  hiringOrganization?: { name?: string };
  jobLocation?: {
    address?:
      | { addressLocality?: string | null; addressCountry?: string | null }
      | Array<{ addressLocality?: string | null; addressCountry?: string | null }>;
  };
}

function normalizeJobPageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.endsWith("/")
      ? parsed.pathname
      : `${parsed.pathname}/`;
    return `${parsed.origin}${path}`;
  } catch {
    return url.endsWith("/") ? url : `${url}/`;
  }
}

function extractJobPostingsFromJson(json: unknown): JobPostingJson[] {
  if (!json || typeof json !== "object") return [];

  const record = json as Record<string, unknown>;
  if (record["@type"] === "JobPosting") {
    return [record as JobPostingJson];
  }

  if (Array.isArray(record["@graph"])) {
    return record["@graph"].flatMap((item) => extractJobPostingsFromJson(item));
  }

  return [];
}

function parseJsonLdScriptContent(raw: string): JobPostingJson[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  try {
    return extractJobPostingsFromJson(JSON.parse(trimmed) as unknown);
  } catch {
    // GotFriends ואחרים: מספר אובייקטי JSON מופרדים בפסיקים באותו script
    try {
      const asArray = JSON.parse(`[${trimmed.replace(/,\s*$/, "")}]`) as unknown;
      if (Array.isArray(asArray)) {
        return asArray.flatMap((item) => extractJobPostingsFromJson(item));
      }
    } catch {
      // ignore malformed blocks
    }
  }

  return [];
}

export function parseAllJobPostingsJsonLd(html: string): JobPostingJson[] {
  const postings: JobPostingJson[] = [];

  for (const block of Array.from(
    html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
    )
  )) {
    postings.push(...parseJsonLdScriptContent(block[1]));
  }

  return postings;
}

export function parseJobPostingJsonLd(
  html: string,
  matchUrl?: string
): JobPostingJson | null {
  const postings = parseAllJobPostingsJsonLd(html);
  if (postings.length === 0) return null;

  if (matchUrl) {
    const target = normalizeJobPageUrl(matchUrl);
    const matched = postings.find(
      (p) => p.url && normalizeJobPageUrl(p.url) === target
    );
    if (matched) return matched;
  }

  return postings[0] ?? null;
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
  // תיוג רך רק כשיש איתות נגישות/התאמה בטקסט — לא על סוג משרה בלבד
  if (
    structuredDesk &&
    /אוטיזם|autism|asd|adhd|קשב|חרדה|נגיש|שילוב|לקות/.test(text)
  ) {
    fits.add("אוטיזם");
    fits.add("חרדה חברתית");
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
  source: string;
  dedupe_key?: string;
  first_seen_at?: string;
  last_seen_at?: string;
  last_verified_at?: string;
}

export function mapJobPostingToRow(
  slug: string,
  applyUrl: string,
  posting: JobPostingJson,
  source = "unknown"
): SyncJobRow | null {
  const title = posting.title?.trim();
  const company = posting.hiringOrganization?.name?.trim();
  const rawDescription = stripHtml(posting.description ?? "");
  const hasRealDescription = rawDescription.length >= 40;
  const description = hasRealDescription
    ? rawDescription
    : `${title}. משרה ב${company}. ${rawDescription}`.trim();

  if (!slug || !title || !company || description.length < 25) return null;
  // דחיית משרות בלי תיאור ממשי (רק כותרת מרופדת)
  if (!hasRealDescription && rawDescription.length < 20) return null;
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
    typeof posting.baseSalary === "number" && posting.baseSalary > 0
      ? `${posting.baseSalary.toLocaleString("he-IL")} ₪`
      : "לא צוין";

  const scope = EMPLOYMENT_SCOPE[posting.employmentType ?? ""] ?? "משרה מלאה";

  const createdAt = posting.datePosted
    ? new Date(posting.datePosted).toISOString()
    : new Date().toISOString();

  const now = new Date().toISOString();

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
    source,
    first_seen_at: now,
    last_seen_at: now,
    last_verified_at: now,
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
  "greenhouse-",
] as const;
