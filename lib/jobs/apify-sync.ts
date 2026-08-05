import {
  mapJobPostingToRow,
  slugifyJobPath,
  type SyncJobRow,
} from "@/lib/jobs/job-posting";
import { logger } from "@/lib/logger";

interface ApifyJobItem {
  title?: string;
  company?: string;
  location?: string;
  jobType?: string;
  postedDate?: string;
  url?: string;
  description?: string;
  source?: string;
}

const APIFY_SEARCH_KEYWORDS = [
  "qa",
  "הזנת נתונים",
  "הנהלת חשבונות",
  "עיצוב גרפי",
  "תמיכה טכנית",
  "frontend",
  "ניתוח נתונים",
] as const;

/** AllJobs / JobMaster / JobNet — דרך Apify (WAF) */
const APIFY_SOURCES = ["alljobs", "jobmaster", "jobnet"] as const;

function apifyItemToSlug(item: ApifyJobItem): string | null {
  const source = item.source?.toLowerCase() ?? "external";
  const url = item.url?.trim();
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const idMatch = parsed.pathname.match(/(\d{5,})/);
    if (idMatch) return `${source}-${idMatch[1]}`;
    return slugifyJobPath(source, parsed.pathname);
  } catch {
    return null;
  }
}

function apifyItemToRow(item: ApifyJobItem): SyncJobRow | null {
  const slug = apifyItemToSlug(item);
  const title = item.title?.trim();
  const company = item.company?.trim() || "לא צוין";
  const description =
    item.description?.trim() ||
    `${title}. ${item.location?.trim() ?? "ישראל"}. ${item.jobType?.trim() ?? ""}`.trim();
  const url = item.url?.trim();

  if (!slug || !title || !url || !description) return null;

  const source = item.source?.toLowerCase() ?? "external";
  return mapJobPostingToRow(
    slug,
    url,
    {
      title,
      description,
      datePosted: item.postedDate,
      employmentType: item.jobType?.includes("חלק") ? "PART_TIME" : "FULL_TIME",
      hiringOrganization: { name: company },
      jobLocation: {
        address: { addressLocality: item.location?.trim() || "ישראל" },
      },
    },
    source
  );
}

async function runApifyKeyword(
  keyword: string,
  token: string
): Promise<ApifyJobItem[]> {
  const endpoint =
    "https://api.apify.com/v2/acts/amrameng~israeli-job-boards-scraper/run-sync-get-dataset-items";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      sources: [...APIFY_SOURCES],
      keywords: keyword,
      maxItemsPerSource: 12,
      maxPagesPerSource: 2,
    }),
    signal: AbortSignal.timeout(180_000),
  });

  if (!res.ok) {
    throw new Error(`Apify failed ${res.status} for keyword "${keyword}"`);
  }

  const data = (await res.json()) as ApifyJobItem[];
  return Array.isArray(data) ? data : [];
}

function shouldRunApifyOnThisHost(): boolean {
  // Vercel Hobby — timeout צר; Apify רץ רק מ-GitHub Actions / מקומי
  if (process.env.VERCEL === "1") return false;
  if (process.env.SKIP_APIFY === "1") return false;
  return true;
}

/** סנכרון AllJobs / JobMaster / JobNet — דורש APIFY_TOKEN; לא רץ על Vercel */
export async function syncApifyJobs(): Promise<SyncJobRow[]> {
  if (!shouldRunApifyOnThisHost()) {
    logger.warn("Apify skipped on this host (use GitHub Actions)", {
      vercel: process.env.VERCEL === "1",
    });
    return [];
  }

  const token = process.env.APIFY_TOKEN?.trim();
  if (!token) return [];

  const bySlug = new Map<string, SyncJobRow>();

  for (const keyword of APIFY_SEARCH_KEYWORDS) {
    try {
      const items = await runApifyKeyword(keyword, token);
      for (const item of items) {
        const row = apifyItemToRow(item);
        if (row) bySlug.set(row.slug, row);
      }
    } catch (err) {
      logger.warn("Apify job sync keyword failed", {
        keyword,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return [...bySlug.values()];
}
