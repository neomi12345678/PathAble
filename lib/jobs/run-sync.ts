import { createAdminClient } from "@/lib/supabase/admin";
import {
  DRUSHIM_SEARCH_QUERIES,
  extractJobUrlsFromSearchHtml,
  JOBS_PER_QUERY,
  mapDrushimPostingToJob,
  parseJobPostingJsonLd,
} from "@/lib/jobs/drushim-sync";
import { logger } from "@/lib/logger";

const USER_AGENT = "PathAble/1.0 (+https://github.com/pathable)";

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status}: ${url}`);
  }
  return res.text();
}

async function collectJobUrls(): Promise<string[]> {
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const query of DRUSHIM_SEARCH_QUERIES) {
    const searchUrl = `https://www.drushim.co.il/jobs/search/${query}/`;
    const html = await fetchText(searchUrl);
    const found = extractJobUrlsFromSearchHtml(html).slice(0, JOBS_PER_QUERY);
    for (const url of found) {
      if (!seen.has(url)) {
        seen.add(url);
        urls.push(url);
      }
    }
  }

  return urls;
}

/** סנכרון משרות אמיתיות מדרושים אל Supabase. מחזיר את מספר המשרות שסונכרנו. */
export async function runJobSync(): Promise<{ synced: number }> {
  const supabase = createAdminClient();
  const jobUrls = await collectJobUrls();
  logger.info("Job sync: collected URLs", { count: jobUrls.length });

  const rows = [];
  for (const url of jobUrls) {
    try {
      const html = await fetchText(url);
      const posting = parseJobPostingJsonLd(html);
      if (!posting) continue;
      const row = mapDrushimPostingToJob(url, posting);
      if (row) rows.push(row);
    } catch (err) {
      logger.warn("Job sync: skipped URL", {
        url,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (rows.length === 0) {
    throw new Error("No jobs parsed from Drushim");
  }

  const { error: deactivateErr } = await supabase
    .from("jobs")
    .update({ active: false })
    .like("slug", "job-%");
  if (deactivateErr) throw deactivateErr;

  const { error: upsertErr } = await supabase.from("jobs").upsert(rows, {
    onConflict: "slug",
  });
  if (upsertErr) throw upsertErr;

  logger.info("Job sync complete", { synced: rows.length });
  return { synced: rows.length };
}
