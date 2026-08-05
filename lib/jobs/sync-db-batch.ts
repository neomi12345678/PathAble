import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

/** PostgREST puts .in() values in the URL — Hebrew/long slugs overflow ~16KB quickly */
export const SLUG_IN_FILTER_CHUNK = 40;
/** dedupe_key often contains Hebrew → heavy percent-encoding in query strings */
export const DEDUPE_KEY_IN_FILTER_CHUNK = 20;
/** RPC payloads travel in POST body — safe for larger batches */
export const RPC_ARRAY_BATCH = 300;

export function chunkArray<T>(items: T[], size: number): T[][] {
  if (items.length === 0) return [];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function isMissingRpcError(message: string): boolean {
  return /function.*does not exist|could not find.*function/i.test(message);
}

async function rpcAvailable(
  fn: "deactivate_jobs_by_slugs" | "get_job_timestamps_by_slugs" | "find_active_jobs_by_dedupe_keys"
): Promise<boolean> {
  const supabase = createAdminClient();
  const probe =
    fn === "deactivate_jobs_by_slugs"
      ? await supabase.rpc(fn, { p_slugs: [] as string[] })
      : fn === "get_job_timestamps_by_slugs"
        ? await supabase.rpc(fn, { p_slugs: [] as string[] })
        : await supabase.rpc(fn, { p_keys: [] as string[] });

  if (!probe.error) return true;
  return isMissingRpcError(probe.error.message);
}

export async function deactivateJobsBySlugs(slugs: string[]): Promise<void> {
  if (slugs.length === 0) return;
  const supabase = createAdminClient();
  const useRpc = await rpcAvailable("deactivate_jobs_by_slugs");

  if (useRpc) {
    for (const batch of chunkArray(slugs, RPC_ARRAY_BATCH)) {
      const { error } = await supabase.rpc("deactivate_jobs_by_slugs", {
        p_slugs: batch,
      });
      if (error) throw error;
    }
    return;
  }

  logger.warn("deactivate_jobs_by_slugs RPC missing — using chunked .in() fallback");
  for (const chunk of chunkArray(slugs, SLUG_IN_FILTER_CHUNK)) {
    const { error } = await supabase
      .from("jobs")
      .update({ active: false })
      .in("slug", chunk);
    if (error) throw error;
  }
}

export async function fetchJobTimestampsBySlugs(
  slugs: string[]
): Promise<Map<string, { firstSeen: string; createdAt: string }>> {
  const map = new Map<string, { firstSeen: string; createdAt: string }>();
  if (slugs.length === 0) return map;

  const supabase = createAdminClient();
  const useRpc = await rpcAvailable("get_job_timestamps_by_slugs");

  if (useRpc) {
    for (const batch of chunkArray(slugs, RPC_ARRAY_BATCH)) {
      const { data, error } = await supabase.rpc("get_job_timestamps_by_slugs", {
        p_slugs: batch,
      });
      if (error) throw error;
      for (const row of data ?? []) {
        if (
          typeof row.slug === "string" &&
          typeof row.first_seen_at === "string" &&
          typeof row.created_at === "string"
        ) {
          map.set(row.slug, {
            firstSeen: row.first_seen_at,
            createdAt: row.created_at,
          });
        }
      }
    }
    return map;
  }

  for (const chunk of chunkArray(slugs, SLUG_IN_FILTER_CHUNK)) {
    const { data: fallbackData, error: fallbackErr } = await supabase
      .from("jobs")
      .select("slug, first_seen_at, created_at")
      .in("slug", chunk);
    if (fallbackErr) throw fallbackErr;
    for (const e of fallbackData ?? []) {
      if (
        typeof e.first_seen_at === "string" &&
        typeof e.created_at === "string"
      ) {
        map.set(e.slug, {
          firstSeen: e.first_seen_at,
          createdAt: e.created_at,
        });
      }
    }
  }

  return map;
}

export async function findActiveJobsByDedupeKeys(
  keys: string[]
): Promise<Array<{ slug: string; dedupe_key: string }>> {
  if (keys.length === 0) return [];

  const rows: Array<{ slug: string; dedupe_key: string }> = [];
  const supabase = createAdminClient();
  const useRpc = await rpcAvailable("find_active_jobs_by_dedupe_keys");

  if (useRpc) {
    for (const batch of chunkArray(keys, RPC_ARRAY_BATCH)) {
      const { data, error } = await supabase.rpc(
        "find_active_jobs_by_dedupe_keys",
        { p_keys: batch }
      );
      if (error) throw error;
      for (const row of data ?? []) {
        if (typeof row.slug === "string" && typeof row.dedupe_key === "string") {
          rows.push({ slug: row.slug, dedupe_key: row.dedupe_key });
        }
      }
    }
    return rows;
  }

  for (const chunk of chunkArray(keys, DEDUPE_KEY_IN_FILTER_CHUNK)) {
    const { data: fallbackData, error: fallbackErr } = await supabase
      .from("jobs")
      .select("slug, dedupe_key")
      .eq("active", true)
      .in("dedupe_key", chunk);
    if (fallbackErr) throw fallbackErr;
    for (const row of fallbackData ?? []) {
      if (typeof row.slug === "string" && typeof row.dedupe_key === "string") {
        rows.push({ slug: row.slug, dedupe_key: row.dedupe_key });
      }
    }
  }

  return rows;
}
