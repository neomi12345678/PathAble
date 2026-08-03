import { syncApifyJobs } from "@/lib/jobs/apify-sync";
import {
  computeDedupeKey,
  dedupeJobRows,
  findDuplicateSlugsToDeactivate,
} from "@/lib/jobs/dedup";
import {
  DRUSHIM_SEARCH_QUERIES,
  extractJobUrlsFromSearchHtml,
  JOBS_PER_QUERY,
  mapDrushimPostingToJob,
} from "@/lib/jobs/drushim-sync";
import { syncGotFriendsJobs } from "@/lib/jobs/gotfriends-sync";
import { syncGreenhouseJobs } from "@/lib/jobs/greenhouse-sync";
import { fetchText, USER_AGENT } from "@/lib/jobs/http-fetch";
import { type SyncJobRow } from "@/lib/jobs/job-posting";
import {
  checkStaleNewJobsAlert,
  recordSourceFailure,
  recordSourceSuccess,
} from "@/lib/jobs/sync-health";
import { verifyJobPage } from "@/lib/jobs/verify-job-page";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

interface SourceResult {
  source: string;
  prefix: string;
  rows: SyncJobRow[];
  ok: boolean;
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
      const verified = await verifyJobPage(url);
      if (!verified.ok) continue;
      const row = mapDrushimPostingToJob(verified.finalUrl, verified.posting);
      if (row) {
        row.last_verified_at = new Date().toISOString();
        rows.push(row);
      }
    } catch (err) {
      logger.warn("Drushim job skipped", {
        url,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return rows;
}

async function runSource(
  source: string,
  prefix: string,
  fetchRows: () => Promise<SyncJobRow[]>
): Promise<SourceResult> {
  try {
    const rows = await fetchRows();
    await recordSourceSuccess(source, rows.length);
    return { source, prefix, rows, ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await recordSourceFailure(source, message);
    logger.warn("Job source sync failed", { source, error: message });
    return { source, prefix, rows: [], ok: false };
  }
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

async function deactivateBySlugs(slugs: string[]): Promise<void> {
  if (slugs.length === 0) return;
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("jobs")
    .update({ active: false })
    .in("slug", slugs);
  if (error) throw error;
}

async function upsertJobsWithTimestamps(rows: SyncJobRow[]): Promise<number> {
  if (rows.length === 0) return 0;

  const supabase = createAdminClient();
  const slugs = rows.map((r) => r.slug);

  const { data: existing } = await supabase
    .from("jobs")
    .select("slug, first_seen_at")
    .in("slug", slugs);

  const firstSeenMap = new Map(
    (existing ?? []).map((e) => [e.slug, e.first_seen_at as string])
  );

  const now = new Date().toISOString();
  let newCount = 0;

  const payload = rows.map((row) => {
    const priorFirst = firstSeenMap.get(row.slug);
    if (!priorFirst) newCount += 1;
    const dedupeKey = row.dedupe_key ?? computeDedupeKey(row);
    return {
      ...row,
      dedupe_key: dedupeKey,
      first_seen_at: priorFirst ?? row.first_seen_at ?? now,
      last_seen_at: now,
      last_verified_at: row.last_verified_at ?? now,
      active: true,
    };
  });

  const { error } = await supabase.from("jobs").upsert(payload, {
    onConflict: "slug",
  });
  if (error) throw error;

  return newCount;
}

async function persistSource(result: SourceResult): Promise<number> {
  if (!result.ok || result.rows.length === 0) {
    if (result.ok) {
      logger.warn("Job sync: source returned 0 jobs", { source: result.source });
    }
    return 0;
  }

  const slugs = result.rows.map((r) => r.slug);
  await deactivateStaleForPrefix(result.prefix, slugs);

  logger.info("Job sync source complete", {
    source: result.source,
    synced: result.rows.length,
  });

  return result.rows.length;
}

/** סנכרון משרות מכל המקורות — רק משרות פעילות ועדכניות */
export async function runJobSync(): Promise<{
  synced: number;
  newJobs: number;
  bySource: Record<string, number>;
}> {
  const supabase = createAdminClient();

  const { error: seedErr } = await supabase
    .from("jobs")
    .update({ active: false })
    .like("slug", "job-%");
  if (seedErr) throw seedErr;

  const [drushim, gotfriends, apifyRows, greenhouseRows] = await Promise.all([
    runSource("drushim", "drushim-", syncDrushimJobs),
    runSource("gotfriends", "gotfriends-", syncGotFriendsJobs),
    runSource("apify", "alljobs-", syncApifyJobs),
    runSource("greenhouse", "greenhouse-", syncGreenhouseJobs),
  ]);

  const apifyBySource: SourceResult[] = [
    {
      source: "alljobs",
      prefix: "alljobs-",
      rows: apifyRows.rows.filter((r) => r.slug.startsWith("alljobs-")),
      ok: apifyRows.ok,
    },
    {
      source: "jobmaster",
      prefix: "jobmaster-",
      rows: apifyRows.rows.filter((r) => r.slug.startsWith("jobmaster-")),
      ok: apifyRows.ok,
    },
    {
      source: "jobnet",
      prefix: "jobnet-",
      rows: apifyRows.rows.filter((r) => r.slug.startsWith("jobnet-")),
      ok: apifyRows.ok,
    },
  ];

  const sources: SourceResult[] = [drushim, gotfriends, ...apifyBySource, greenhouseRows];

  const bySource: Record<string, number> = {};
  for (const source of sources) {
    bySource[source.source] = await persistSource(source);
  }

  const allRows: SyncJobRow[] = sources.flatMap((s) => s.rows);
  const winners = dedupeJobRows(allRows);
  const duplicateSlugs = findDuplicateSlugsToDeactivate(allRows, winners);

  const newJobs = await upsertJobsWithTimestamps(winners);
  await deactivateBySlugs(duplicateSlugs);

  const total = winners.length;
  const anyOk = sources.some((s) => s.ok && s.rows.length > 0);

  if (total === 0 && !anyOk) {
    throw new Error("No active jobs synced — all sources failed or returned empty");
  }

  await checkStaleNewJobsAlert();

  logger.info("Job sync complete", { synced: total, newJobs, bySource });
  return { synced: total, newJobs, bySource };
}

/** בדיקת חיבור למקור (לשימוש ב-health checks) */
export async function probeJobSources(): Promise<void> {
  await fetch("https://www.drushim.co.il/jobs/search/qa/", {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(10_000),
  });
}
