import { fetchText } from "@/lib/jobs/http-fetch";
import {
  mapJobPostingToRow,
  slugifyJobPath,
  type JobPostingJson,
  type SyncJobRow,
} from "@/lib/jobs/job-posting";
import { verifyJobPage } from "@/lib/jobs/verify-job-page";

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

    // דפי אגרגציה (qa-positions וכו') — לא משרה בודדת
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

export async function collectGotFriendsJobUrls(): Promise<string[]> {
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const category of GOTFRIENDS_CATEGORIES) {
    const pageUrl = `https://www.gotfriends.co.il/jobslobby/${category}/`;
    try {
      const html = await fetchText(pageUrl);
      for (const jobUrl of extractGotFriendsJobUrls(html, category)) {
        if (!seen.has(jobUrl)) {
          seen.add(jobUrl);
          urls.push(jobUrl);
        }
      }
    } catch {
      // category page unavailable — skip
    }
  }

  return urls;
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

  for (const url of urls) {
    try {
      const row = await fetchGotFriendsJob(url);
      if (row) rows.push(row);
    } catch {
      // skip broken listing
    }
  }

  return rows;
}
