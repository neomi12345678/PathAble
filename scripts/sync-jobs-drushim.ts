/**
 * Sync real job listings from Drushim.co.il into Supabase.
 * Run: npm run sync:jobs
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { createAdminClient } from "../lib/supabase/admin";
import {
  DRUSHIM_SEARCH_QUERIES,
  extractJobUrlsFromSearchHtml,
  JOBS_PER_QUERY,
  mapDrushimPostingToJob,
  parseJobPostingJsonLd,
} from "../lib/jobs/drushim-sync";

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
    console.log(`Searching: ${searchUrl}`);
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

async function sync(): Promise<void> {
  const supabase = createAdminClient();
  const jobUrls = await collectJobUrls();
  console.log(`Found ${jobUrls.length} unique job URLs`);

  const rows = [];
  for (const url of jobUrls) {
    try {
      const html = await fetchText(url);
      const posting = parseJobPostingJsonLd(html);
      if (!posting) {
        console.warn(`No JobPosting JSON-LD: ${url}`);
        continue;
      }
      const row = mapDrushimPostingToJob(url, posting);
      if (row) rows.push(row);
    } catch (err) {
      console.warn(`Skip ${url}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`Parsed ${rows.length} jobs`);

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

  console.log(`Synced ${rows.length} real Drushim jobs. Old seed jobs deactivated.`);
}

sync().catch((err: unknown) => {
  console.error("Job sync failed:", err);
  process.exit(1);
});
