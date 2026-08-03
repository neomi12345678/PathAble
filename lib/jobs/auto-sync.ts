import { createAdminClient, tryCreateAdminClient } from "@/lib/supabase/admin";

const STALE_MS = 3 * 60 * 60 * 1000; // 3 שעות
const STUCK_SYNC_MS = 20 * 60 * 1000; // 20 דקות

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

function isStale(lastSyncedAt: string | null): boolean {
  if (!lastSyncedAt) return true;
  const ts = new Date(lastSyncedAt).getTime();
  if (Number.isNaN(ts)) return true;
  return Date.now() - ts > STALE_MS;
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
} | null> {
  const supabase = tryCreateAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("job_sync_meta")
    .select("last_synced_at, sync_in_progress, sync_started_at")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    lastSyncedAt: data.last_synced_at,
    syncInProgress: data.sync_in_progress,
    syncStartedAt: data.sync_started_at,
  };
}

/** האם כדאי להפעיל סנכron ברקע */
export async function shouldTriggerAutoSync(): Promise<boolean> {
  const state = await readSyncState();
  if (!state) return true;

  if (state.syncInProgress && !isStuckSync(state.syncStartedAt)) {
    return false;
  }

  return isStale(state.lastSyncedAt) || isStuckSync(state.syncStartedAt);
}

/** נעילה לפני סנכron — מחזיר false אם כבר רץ */
export async function ensureSyncLockForCron(): Promise<boolean> {
  const supabase = createAdminClient();
  const state = await readSyncState();

  if (state?.syncInProgress && !isStuckSync(state.syncStartedAt)) {
    return false;
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("job_sync_meta")
    .update({
      sync_in_progress: true,
      sync_started_at: now,
    })
    .eq("id", 1);

  return !error;
}

export async function markJobSyncComplete(): Promise<void> {
  const supabase = tryCreateAdminClient();
  if (!supabase) return;

  const now = new Date().toISOString();
  await supabase
    .from("job_sync_meta")
    .update({
      last_synced_at: now,
      sync_in_progress: false,
      sync_started_at: null,
    })
    .eq("id", 1);
}

export async function markJobSyncFailed(): Promise<void> {
  const supabase = tryCreateAdminClient();
  if (!supabase) return;

  await supabase
    .from("job_sync_meta")
    .update({
      sync_in_progress: false,
      sync_started_at: null,
    })
    .eq("id", 1);
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
 * מפעיל סנכron ברקע אם הנתונים ישנים מ-3 שעות.
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
    });
    return;
  }

  if (!(await ensureSyncLockForCron())) return;

  const { runJobSync } = await import("@/lib/jobs/run-sync");
  void runJobSync()
    .then(() => markJobSyncComplete())
    .catch(async () => {
      await markJobSyncFailed();
    });
}
