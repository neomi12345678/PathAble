import {
  mapJobPostingToRow,
  slugifyJobPath,
  stripHtml,
  type SyncJobRow,
} from "@/lib/jobs/job-posting";
import { USER_AGENT } from "@/lib/jobs/http-fetch";
import { type SourceFetchResult } from "@/lib/jobs/sync-health";
import { logger } from "@/lib/logger";

interface GreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  location: { name: string };
  content: string;
  updated_at: string;
  departments?: Array<{ name: string }>;
}

interface GreenhouseBoard {
  token: string;
  company: string;
}

/** לוחות Greenhouse שעובדים (404 tokens הוסרו) */
const GREENHOUSE_BOARDS: GreenhouseBoard[] = [
  { token: "gongio", company: "Gong" },
  { token: "riskified", company: "Riskified" },
  { token: "similarweb", company: "Similarweb" },
  { token: "lightricks", company: "Lightricks" },
  { token: "taboola", company: "Taboola" },
  { token: "appsflyer", company: "AppsFlyer" },
  { token: "melio", company: "Melio" },
  { token: "payoneer", company: "Payoneer" },
  { token: "jfrog", company: "JFrog" },
  { token: "catonetworks", company: "Cato Networks" },
  { token: "cybereason", company: "Cybereason" },
  { token: "nice", company: "NICE" },
];

function isIsraelRelevant(location: string, content: string): boolean {
  const text = `${location} ${stripHtml(content)}`.toLowerCase();
  // דורש סימן ישראל/עיר — לא רק "remote" גלובלי
  return /israel|tel aviv|tel-?aviv|herzliya|raanana|haifa|jerusalem|ירושלים|תל.?אביב|הרצליה|רעננה|חיפה|ישראל/i.test(
    text
  );
}

async function fetchBoardJobs(board: GreenhouseBoard): Promise<SyncJobRow[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${board.token}/jobs?content=true`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(`Greenhouse ${board.token}: HTTP ${res.status}`);
  }

  const payload = (await res.json()) as { jobs?: GreenhouseJob[] };
  const jobs = payload.jobs ?? [];
  const rows: SyncJobRow[] = [];
  const now = new Date().toISOString();

  for (const job of jobs) {
    const location = job.location?.name?.trim() ?? "";
    if (!isIsraelRelevant(location, job.content ?? "")) continue;

    const slug = slugifyJobPath("greenhouse", `${board.token}-${job.id}`);
    const row = mapJobPostingToRow(slug, job.absolute_url, {
      title: job.title,
      description: job.content,
      datePosted: job.updated_at,
      employmentType: "FULL_TIME",
      hiringOrganization: { name: board.company },
      jobLocation: { address: { addressLocality: location || "ישראל" } },
    });

    if (!row) continue;

    row.source = "greenhouse";
    row.first_seen_at = now;
    row.last_seen_at = now;
    row.last_verified_at = now;
    rows.push(row);
  }

  return rows;
}

export async function syncGreenhouseJobs(): Promise<SourceFetchResult> {
  const bySlug = new Map<string, SyncJobRow>();
  const boardFailures: string[] = [];

  for (const board of GREENHOUSE_BOARDS) {
    try {
      const rows = await fetchBoardJobs(board);
      for (const row of rows) {
        bySlug.set(row.slug, row);
      }
    } catch (err) {
      boardFailures.push(board.token);
      logger.warn("Greenhouse board failed", {
        board: board.token,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (boardFailures.length === GREENHOUSE_BOARDS.length) {
    throw new Error(
      `Greenhouse: all ${GREENHOUSE_BOARDS.length} boards failed (${boardFailures.join(", ")})`
    );
  }

  if (boardFailures.length > 0) {
    logger.warn("Greenhouse partial board failures", {
      failed: boardFailures,
      okBoards: GREENHOUSE_BOARDS.length - boardFailures.length,
    });
  }

  return {
    rows: [...bySlug.values()],
    fetchComplete: boardFailures.length === 0,
  };
}
