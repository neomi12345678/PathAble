import {
  mapJobPostingToRow,
  parseJobPostingJsonLd,
  slugifyJobPath,
  type SyncJobRow,
} from "@/lib/jobs/job-posting";

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

const USER_AGENT = "PathAble/1.0 (+https://github.com/pathable)";

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
  return res.text();
}

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
  const html = await fetchText(url);
  const posting = parseJobPostingJsonLd(html);
  if (!posting) return null;

  const slug = gotfriendsUrlToSlug(url);
  if (!slug) return null;

  return mapJobPostingToRow(slug, url, posting);
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
