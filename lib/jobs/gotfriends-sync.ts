import { fetchJobPage } from "@/lib/jobs/http-fetch";
import {
  mapJobPostingToRow,
  slugifyJobPath,
  type JobPostingJson,
  type SyncJobRow,
} from "@/lib/jobs/job-posting";
import { verifyJobPage } from "@/lib/jobs/verify-job-page";
import { logger } from "@/lib/logger";

function enrichGotFriendsPosting(html: string, posting: JobPostingJson): JobPostingJson {
  const ogDesc = html.match(/property="og:description"\s+content="([^"]+)"/i)?.[1];
  const description = posting.description?.trim();
  if (!description && ogDesc) {
    posting.description = ogDesc.replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  }
  return posting;
}

export const GOTFRIENDS_CATEGORIES = [
  "qa",
  "software",
  "datasecurity",
  "ai",
  "projects",
  "graduates",
  "devops",
  "product",
  "design",
  "executive-position",
] as const;

export function extractGotFriendsJobUrls(html: string, category: string): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];

  const hrefs = [
    ...Array.from(
      html.matchAll(/href="(https:\/\/www\.gotfriends\.co\.il\/jobslobby\/[^"]+)"/gi)
    ),
    ...Array.from(html.matchAll(/href="(\/jobslobby\/[^"]+)"/gi)),
  ];

  for (const match of hrefs) {
    const raw = match[1].replace(/&amp;/g, "&");
    const absolute = raw.startsWith("http")
      ? raw
      : `https://www.gotfriends.co.il${raw}`;
    if (absolute.includes("/area/")) continue;

    let pathname: string;
    try {
      pathname = new URL(absolute).pathname;
    } catch {
      continue;
    }

    const parts = pathname.split("/").filter(Boolean);
    if (parts.length !== 3 || parts[0] !== "jobslobby" || parts[1] !== category) {
      continue;
    }

    if (parts[2].endsWith("-positions") || parts[2] === "positions") {
      continue;
    }

    const url = absolute.endsWith("/") ? absolute : `${absolute}/`;
    if (!seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }

  return urls;
}

export function gotfriendsUrlToSlug(url: string): string | null {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    if (parts.length < 3 || parts[0] !== "jobslobby") return null;
    return slugifyJobPath("gotfriends", parts.slice(1).join("/"));
  } catch {
    return null;
  }
}

interface CategoryFetchFailure {
  category: string;
  status: number;
  reason: string;
  detail?: string;
}

export async function collectGotFriendsJobUrls(): Promise<string[]> {
  const seen = new Set<string>();
  const urls: string[] = [];
  const categoryFailures: CategoryFetchFailure[] = [];

  for (const category of GOTFRIENDS_CATEGORIES) {
    const pageUrl = `https://www.gotfriends.co.il/jobslobby/${category}/`;
    const page = await fetchJobPage(pageUrl);

    if (!page.ok) {
      categoryFailures.push({
        category,
        status: page.status,
        reason: page.reason ?? "fetch_error",
        detail: page.errorDetail,
      });
      continue;
    }

    for (const jobUrl of extractGotFriendsJobUrls(page.html, category)) {
      if (!seen.has(jobUrl)) {
        seen.add(jobUrl);
        urls.push(jobUrl);
      }
    }
  }

  if (categoryFailures.length > 0) {
    logger.warn("GotFriends category pages failed", {
      failed: categoryFailures.length,
      total: GOTFRIENDS_CATEGORIES.length,
      samples: categoryFailures.slice(0, 5),
    });
  }

  if (urls.length === 0) {
    logger.warn("GotFriends: no job URLs collected", {
      categoryFailures,
      categoriesTried: GOTFRIENDS_CATEGORIES.length,
    });
  }

  return urls;
}

function bumpReason(
  counts: Record<string, number>,
  key: string
): void {
  counts[key] = (counts[key] ?? 0) + 1;
}

export async function fetchGotFriendsJob(url: string): Promise<SyncJobRow | null> {
  const verified = await verifyJobPage(url);
  if (!verified.ok) return null;

  const slug = gotfriendsUrlToSlug(verified.finalUrl);
  if (!slug) return null;

  const posting = enrichGotFriendsPosting(verified.html, verified.posting);
  const row = mapJobPostingToRow(
    slug,
    verified.finalUrl,
    posting,
    "gotfriends"
  );
  if (row) row.last_verified_at = new Date().toISOString();
  return row;
}

export async function syncGotFriendsJobs(): Promise<SyncJobRow[]> {
  const urls = await collectGotFriendsJobUrls();
  const rows: SyncJobRow[] = [];
  const verifyFailures: Record<string, number> = {};
  const otherFailures: Record<string, number> = {};

  for (const url of urls) {
    try {
      const verified = await verifyJobPage(url);
      if (!verified.ok) {
        const key =
          verified.reason === "fetch_error" && verified.httpStatus
            ? `fetch_error_${verified.httpStatus}`
            : verified.reason;
        bumpReason(verifyFailures, key);
        continue;
      }

      const slug = gotfriendsUrlToSlug(verified.finalUrl);
      if (!slug) {
        bumpReason(otherFailures, "invalid_slug");
        continue;
      }

      const posting = enrichGotFriendsPosting(verified.html, verified.posting);
      const row = mapJobPostingToRow(
        slug,
        verified.finalUrl,
        posting,
        "gotfriends"
      );
      if (!row) {
        bumpReason(otherFailures, "map_row_rejected");
        continue;
      }

      row.last_verified_at = new Date().toISOString();
      rows.push(row);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const key = message.includes("timeout")
        ? "exception_timeout"
        : message.includes("certificate") || message.includes("SSL")
          ? "exception_ssl"
          : "exception_other";
      bumpReason(otherFailures, key);
      logger.warn("GotFriends job exception", { url, error: message });
    }
  }

  if (rows.length === 0) {
    logger.warn("GotFriends sync returned 0 jobs", {
      urlsFound: urls.length,
      verifyFailures,
      otherFailures,
    });
  } else if (Object.keys(verifyFailures).length > 0) {
    logger.warn("GotFriends sync partial failures", {
      synced: rows.length,
      urlsFound: urls.length,
      verifyFailures,
      otherFailures,
    });
  }

  return rows;
}
