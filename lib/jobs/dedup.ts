import type { SyncJobRow } from "@/lib/jobs/job-posting";

const COMPANY_ALIASES: Record<string, string> = {
  "monday com": "monday",
  mondaydotcom: "monday",
  "wix com": "wix",
  gotfriends: "gotfriends",
  "got friends": "gotfriends",
};

const GENERIC_CITIES = new Set([
  "ישראל",
  "israel",
  "il",
  "remote",
  "hybrid",
  "עבודה מהבית",
  "מהבית",
]);

function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCompany(company: string): string {
  const base = normalizeToken(company);
  return COMPANY_ALIASES[base] ?? base;
}

function normalizeCity(city: string): string {
  const primary = normalizeToken(city.split("·")[0] ?? city);
  if (!primary || GENERIC_CITIES.has(primary)) return "*";
  return primary;
}

/** מפתח לזיהוי כפילויות: חברה + תפקיד + מיקום (מיקום גנרי = *) */
export function computeDedupeKey(
  row: Pick<SyncJobRow, "company" | "title" | "city">
): string {
  const company = normalizeCompany(row.company);
  const title = normalizeToken(row.title);
  const city = normalizeCity(row.city);
  return `${company}|${title}|${city}`;
}

const SOURCE_PRIORITY: Record<string, number> = {
  greenhouse: 1,
  drushim: 2,
  gotfriends: 3,
  alljobs: 4,
  jobmaster: 5,
  jobnet: 6,
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

/** slugs של משרות בבאטץ' הנוכחי שהפסידו ב-dedup */
export function findDuplicateSlugsToDeactivate(
  allRows: SyncJobRow[],
  winners: SyncJobRow[]
): string[] {
  const winnerSlugs = new Set(winners.map((w) => w.slug));
  const winnerKeys = new Map(
    winners.map((w) => [w.dedupe_key ?? computeDedupeKey(w), w.slug])
  );

  const deactivate = new Set<string>();
  for (const row of allRows) {
    const key = row.dedupe_key ?? computeDedupeKey(row);
    const winnerSlug = winnerKeys.get(key);
    if (winnerSlug && winnerSlug !== row.slug && !winnerSlugs.has(row.slug)) {
      deactivate.add(row.slug);
    }
  }
  return [...deactivate];
}

export function isPlaceholderCompany(company: string): boolean {
  const n = normalizeToken(company);
  return (
    !n ||
    n === "לא צוין" ||
    n === "gotfriends" ||
    n === "got friends" ||
    n === "unknown" ||
    n === "n a"
  );
}
