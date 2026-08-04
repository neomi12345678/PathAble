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

/** GotFriends דרך Apify — fallback כש-Vercel מקבל 403 */
export async function syncGotFriendsViaApify(): Promise<SyncJobRow[]> {
  const token = process.env.APIFY_TOKEN?.trim();
  if (!token) return [];

  const endpoint = `https://api.apify.com/v2/acts/amrameng~israeli-job-boards-scraper/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sources: ["gotfriends"],
        keywords: "משרות",
        maxItemsPerSource: 60,
        maxPagesPerSource: 5,
      }),
      signal: AbortSignal.timeout(240_000),
    });

    if (!res.ok) {
      logger.warn("GotFriends Apify fallback failed", { status: res.status });
      return [];
    }

    const data = (await res.json()) as ApifyJobItem[];
    if (!Array.isArray(data) || data.length === 0) {
      logger.warn("GotFriends Apify fallback returned 0 items");
      return [];
    }

    const bySlug = new Map<string, SyncJobRow>();
    for (const item of data) {
      const source = item.source?.toLowerCase() ?? "gotfriends";
      if (!source.includes("gotfriends") && !item.url?.includes("gotfriends")) {
        continue;
      }

      const url = item.url?.trim();
      const title = item.title?.trim();
      if (!url || !title) continue;

      let slug: string | null = null;
      try {
        const parsed = new URL(url);
        if (parsed.hostname.includes("gotfriends")) {
          const parts = parsed.pathname.split("/").filter(Boolean);
          if (parts[0] === "jobslobby" && parts.length >= 3) {
            slug = slugifyJobPath("gotfriends", parts.slice(1).join("/"));
          }
        }
      } catch {
        continue;
      }

      if (!slug) continue;

      const company = item.company?.trim() || "Gotfriends";
      const description =
        item.description?.trim() ||
        `${title}. ${item.location?.trim() ?? "ישראל"}.`.trim();

      const row = mapJobPostingToRow(
        slug,
        url,
        {
          title,
          description,
          datePosted: item.postedDate,
          employmentType: "FULL_TIME",
          hiringOrganization: { name: company },
          jobLocation: {
            address: { addressLocality: item.location?.trim() || "ישראל" },
          },
        },
        "gotfriends"
      );

      if (row) bySlug.set(slug, row);
    }

    const rows = [...bySlug.values()];
    logger.warn("GotFriends Apify fallback complete", { count: rows.length });
    return rows;
  } catch (err) {
    logger.warn("GotFriends Apify fallback error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}
