import { tryCreateAdminClient } from "@/lib/supabase/admin";
import {
  acquireSyncLockAtomic,
  getAdaptiveStaleMs,
  markSyncFailure,
  markSyncSuccess,
} from "@/lib/jobs/sync-health";

const STUCK_SYNC_MS = 25 * 60 * 1000;

export interface JobSyncMeta {
  lastSyncedAt: string | null;
  syncInProgress: boolean;
}

export async function getJobSyncMeta(): Promise<JobSyncMeta | null> {
  const supabase = tryCreateAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("job_sync_meta")
    .select("last_synced_at, sync_in_progress")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    lastSyncedAt: data.last_synced_at,
    syncInProgress: data.sync_in_progress,
  };
}

function isStale(lastSyncedAt: string | null, staleMs: number): boolean {
  if (!lastSyncedAt) return true;
  const ts = new Date(lastSyncedAt).getTime();
  if (Number.isNaN(ts)) return true;
  return Date.now() - ts > staleMs;
}

function isStuckSync(startedAt: string | null): boolean {
  if (!startedAt) return false;
  const ts = new Date(startedAt).getTime();
  if (Number.isNaN(ts)) return true;
  return Date.now() - ts > STUCK_SYNC_MS;
}

async function readSyncState(): Promise<{
  lastSyncedAt: string | null;
  syncInProgress: boolean;
  syncStartedAt: string | null;
  nextRetryAt: string | null;
} | null> {
  const supabase = tryCreateAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("job_sync_meta")
    .select("last_synced_at, sync_in_progress, sync_started_at, next_retry_at")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    lastSyncedAt: data.last_synced_at,
    syncInProgress: data.sync_in_progress,
    syncStartedAt: data.sync_started_at,
    nextRetryAt: data.next_retry_at,
  };
}

/** האם כדאי להפעיל סנכron ברקע */
export async function shouldTriggerAutoSync(): Promise<boolean> {
  const state = await readSyncState();
  if (!state) return true;

  if (state.nextRetryAt) {
    const retry = new Date(state.nextRetryAt).getTime();
    if (Date.now() < retry) return false;
  }

  if (state.syncInProgress && !isStuckSync(state.syncStartedAt)) {
    return false;
  }

  const staleMs = await getAdaptiveStaleMs();
  return isStale(state.lastSyncedAt, staleMs) || isStuckSync(state.syncStartedAt);
}

/** נעילה אטומית לפני סנכron */
export async function ensureSyncLockForCron(): Promise<boolean> {
  return acquireSyncLockAtomic();
}

export async function markJobSyncComplete(newJobs = 0): Promise<void> {
  await markSyncSuccess(newJobs);
}

export async function markJobSyncFailed(): Promise<void> {
  await markSyncFailure();
}

function getSiteUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  const publicUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (publicUrl) return publicUrl.replace(/\/$/, "");
  return "http://localhost:3000";
}

/**
 * מפעיל סנכron ברקע אם הנתונים ישנים.
 * בפרודקשן — מפעיל Lambda נפרד דרך /api/cron/sync-jobs.
 */
export async function triggerJobSyncIfStale(): Promise<void> {
  if (!(await shouldTriggerAutoSync())) return;

  const secret = process.env.CRON_SECRET?.trim();
  const siteUrl = getSiteUrl();

  if (secret && siteUrl.startsWith("https://")) {
    void fetch(`${siteUrl}/api/cron/sync-jobs`, {
      method: "GET",
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(15_000),
    }).catch(() => {
      // fire-and-forget — הכשלון לא חוסם את הלוח
    });
    return;
  }

  if (!(await ensureSyncLockForCron())) return;

  const { runJobSync } = await import("@/lib/jobs/run-sync");
  void runJobSync()
    .then(({ newJobs }) => markJobSyncComplete(newJobs))
    .catch(async () => {
      await markJobSyncFailed();
    });
}
