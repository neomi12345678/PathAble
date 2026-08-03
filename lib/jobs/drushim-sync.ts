import {
  enrichDisabilityFit,
  mapJobPostingToRow,
  parseJobPostingJsonLd,
  type JobPostingJson,
  type SyncJobRow,
} from "@/lib/jobs/job-posting";

export {
  enrichDisabilityFit,
  parseJobPostingJsonLd,
  stripHtml,
  type SyncJobRow,
} from "@/lib/jobs/job-posting";

export function extractJobUrlsFromSearchHtml(html: string): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const match of Array.from(
    html.matchAll(/\/job\/(\d+)\/([a-f0-9]+)\//g)
  )) {
    const url = `https://www.drushim.co.il/job/${match[1]}/${match[2]}/`;
    if (!seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }
  return urls;
}

export function drushimUrlToSlug(url: string): string | null {
  const match = url.match(/\/job\/(\d+)\/[a-f0-9]+\//);
  return match ? `drushim-${match[1]}` : null;
}

export function mapDrushimPostingToJob(
  applyUrl: string,
  posting: JobPostingJson
): SyncJobRow | null {
  const slug = drushimUrlToSlug(applyUrl);
  if (!slug) return null;
  return mapJobPostingToRow(slug, applyUrl, posting, "drushim");
}

export const DRUSHIM_SEARCH_QUERIES = [
  "qa",
  "כותב%20תוכן",
  "הנהלת%20חשבונות",
  "עיצוב%20גרפי",
  "הזנת%20נתונים",
  "תמיכה%20טכנית",
  "ניתוח%20נתונים",
  "frontend",
  "ux",
  "אבטחת%20מידע",
  "backend",
  "devops",
  "helpdesk",
  "ארכיון",
  "קליטת%20נתונים",
  "בדיקות%20תוכנה",
  "מפתח",
  "הנדסאי",
  "אדמיניסטרציה",
  "שירות%20לקוחות",
] as const;

export const JOBS_PER_QUERY = 8;
