import {
  mapJobPostingToRow,
  slugifyJobPath,
  stripHtml,
  type SyncJobRow,
} from "@/lib/jobs/job-posting";
import { USER_AGENT } from "@/lib/jobs/http-fetch";

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

/** דפי Careers ישראליים/גלובליים דרך Greenhouse API */
const GREENHOUSE_BOARDS: GreenhouseBoard[] = [
  { token: "gongio", company: "Gong" },
  { token: "riskified", company: "Riskified" },
  { token: "similarweb", company: "Similarweb" },
  { token: "lightricks", company: "Lightricks" },
  { token: "mondaydotcom", company: "monday.com" },
  { token: "walkme", company: "WalkMe" },
  { token: "taboola", company: "Taboola" },
  { token: "outbrain", company: "Outbrain" },
  { token: "fiverr", company: "Fiverr" },
  { token: "wix", company: "Wix" },
];

function isIsraelRelevant(location: string, content: string): boolean {
  const text = `${location} ${stripHtml(content)}`.toLowerCase();
  return (
    /israel|tel aviv|tel-?aviv|herzliya|raanana|haifa|jerusalem|ירושלים|תל.?אביב|הרצליה|רעננה|חיפה|ישראל|remote/i.test(
      text
    ) || /remote|hybrid|מהבית/i.test(text)
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

export async function syncGreenhouseJobs(): Promise<SyncJobRow[]> {
  const bySlug = new Map<string, SyncJobRow>();

  for (const board of GREENHOUSE_BOARDS) {
    try {
      const rows = await fetchBoardJobs(board);
      for (const row of rows) {
        bySlug.set(row.slug, row);
      }
    } catch {
      // board unavailable — skip, health logged in run-sync
    }
  }

  return [...bySlug.values()];
}
