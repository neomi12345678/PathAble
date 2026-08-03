import { syncApifyJobs } from "@/lib/jobs/apify-sync";
import {
  DRUSHIM_SEARCH_QUERIES,
  extractJobUrlsFromSearchHtml,
  JOBS_PER_QUERY,
  mapDrushimPostingToJob,
  parseJobPostingJsonLd,
} from "@/lib/jobs/drushim-sync";
import { syncGotFriendsJobs } from "@/lib/jobs/gotfriends-sync";
import { SYNCED_JOB_PREFIXES, type SyncJobRow } from "@/lib/jobs/job-posting";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

const USER_AGENT = "PathAble/1.0 (+https://github.com/pathable)";

interface SourceResult {
  source: string;
  prefix: string;
  rows: SyncJobRow[];
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status}: ${url}`);
  }
  return res.text();
}

async function syncDrushimJobs(): Promise<SyncJobRow[]> {
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const query of DRUSHIM_SEARCH_QUERIES) {
    const searchUrl = `https://www.drushim.co.il/jobs/search/${query}/`;
    try {
      const html = await fetchText(searchUrl);
      const found = extractJobUrlsFromSearchHtml(html).slice(0, JOBS_PER_QUERY);
      for (const url of found) {
        if (!seen.has(url)) {
          seen.add(url);
          urls.push(url);
        }
      }
    } catch (err) {
      logger.warn("Drushim search failed", {
        query,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const rows: SyncJobRow[] = [];
  for (const url of urls) {
    try {
      const html = await fetchText(url);
      const posting = parseJobPostingJsonLd(html);
      if (!posting) continue;
      const row = mapDrushimPostingToJob(url, posting);
      if (row) rows.push(row);
    } catch (err) {
      logger.warn("Drushim job skipped", {
        url,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return rows;
}

async function deactivateStaleForPrefix(
  prefix: string,
  activeSlugs: string[]
): Promise<void> {
  const supabase = createAdminClient();
  const activeSet = new Set(activeSlugs);

  const { data: existing, error: selectErr } = await supabase
    .from("jobs")
    .select("slug")
    .like("slug", `${prefix}%`);
  if (selectErr) throw selectErr;

  const staleSlugs =
    existing?.filter((row) => !activeSet.has(row.slug)).map((row) => row.slug) ??
    [];

  if (staleSlugs.length === 0) return;

  const { error } = await supabase
    .from("jobs")
    .update({ active: false })
    .in("slug", staleSlugs);
  if (error) throw error;
}

async function upsertJobs(rows: SyncJobRow[]): Promise<void> {
  if (rows.length === 0) return;
  const supabase = createAdminClient();
  const { error } = await supabase.from("jobs").upsert(rows, {
    onConflict: "slug",
  });
  if (error) throw error;
}

async function persistSource(result: SourceResult): Promise<number> {
  if (result.rows.length === 0) {
    logger.warn("Job sync: source returned 0 jobs", { source: result.source });
    return 0;
  }

  const slugs = result.rows.map((r) => r.slug);
  await deactivateStaleForPrefix(result.prefix, slugs);
  await upsertJobs(result.rows);

  logger.info("Job sync source complete", {
    source: result.source,
    synced: result.rows.length,
  });

  return result.rows.length;
}

/** סנכרון משרות מכל המקורות — רק משרות פעילות ועדכניות */
export async function runJobSync(): Promise<{
  synced: number;
  bySource: Record<string, number>;
}> {
  const supabase = createAdminClient();

  const { error: seedErr } = await supabase
    .from("jobs")
    .update({ active: false })
    .like("slug", "job-%");
  if (seedErr) throw seedErr;

  const [drushimRows, gotfriendsRows, apifyRows] = await Promise.all([
    syncDrushimJobs(),
    syncGotFriendsJobs(),
    syncApifyJobs(),
  ]);

  const sources: SourceResult[] = [
    { source: "drushim", prefix: "drushim-", rows: drushimRows },
    { source: "gotfriends", prefix: "gotfriends-", rows: gotfriendsRows },
    { source: "alljobs", prefix: "alljobs-", rows: apifyRows.filter((r) => r.slug.startsWith("alljobs-")) },
    { source: "jobmaster", prefix: "jobmaster-", rows: apifyRows.filter((r) => r.slug.startsWith("jobmaster-")) },
    { source: "jobnet", prefix: "jobnet-", rows: apifyRows.filter((r) => r.slug.startsWith("jobnet-")) },
  ];

  const bySource: Record<string, number> = {};
  let total = 0;

  for (const source of sources) {
    const count = await persistSource(source);
    bySource[source.source] = count;
    total += count;
  }

  if (total === 0) {
    throw new Error("No active jobs synced from any source");
  }

  logger.info("Job sync complete", { synced: total, bySource, prefixes: SYNCED_JOB_PREFIXES });
  return { synced: total, bySource };
}
