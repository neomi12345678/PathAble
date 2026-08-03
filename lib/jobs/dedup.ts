import type { SyncJobRow } from "@/lib/jobs/job-posting";

function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** מפתח לזיהוי כפילויות: חברה + תפקיד + מיקום */
export function computeDedupeKey(row: Pick<SyncJobRow, "company" | "title" | "city">): string {
  const company = normalizeToken(row.company);
  const title = normalizeToken(row.title);
  const city = normalizeToken(row.city.split("·")[0] ?? row.city);
  return `${company}|${title}|${city}`;
}

const SOURCE_PRIORITY: Record<string, number> = {
  drushim: 1,
  microsoft: 2,
  greenhouse: 3,
  gotfriends: 4,
  alljobs: 5,
  jobmaster: 6,
  jobnet: 7,
  lever: 8,
  unknown: 99,
};

function sourceRank(source: string): number {
  return SOURCE_PRIORITY[source] ?? 50;
}

/** משאיר משרה אחת לכל dedupe_key — המקור המועדף */
export function dedupeJobRows(rows: SyncJobRow[]): SyncJobRow[] {
  const winners = new Map<string, SyncJobRow>();

  for (const row of rows) {
    const key = computeDedupeKey(row);
    row.dedupe_key = key;

    const existing = winners.get(key);
    if (!existing || sourceRank(row.source) < sourceRank(existing.source)) {
      winners.set(key, row);
    }
  }

  return [...winners.values()];
}

/** slugs של משרות שהפסידו ב-dedup וצריך להשבית */
export function findDuplicateSlugsToDeactivate(
  allRows: SyncJobRow[],
  winners: SyncJobRow[]
): string[] {
  const winnerSlugs = new Set(winners.map((w) => w.slug));
  const winnerKeys = new Map(winners.map((w) => [w.dedupe_key, w.slug]));

  const deactivate = new Set<string>();
  for (const row of allRows) {
    const key = computeDedupeKey(row);
    const winnerSlug = winnerKeys.get(key);
    if (winnerSlug && winnerSlug !== row.slug && !winnerSlugs.has(row.slug)) {
      deactivate.add(row.slug);
    }
  }
  return [...deactivate];
}
