import { sendJobSyncAlertEmail } from "@/lib/jobs/alerts";
import { createAdminClient, tryCreateAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

export interface SourceHealthEntry {
  lastSuccess: string | null;
  lastError: string | null;
  failCount: number;
}

export type SourceHealthMap = Record<string, SourceHealthEntry>;

export async function recordSourceSuccess(source: string, count: number): Promise<void> {
  const supabase = tryCreateAdminClient();
  if (!supabase) return;

  const { data } = await supabase
    .from("job_sync_meta")
    .select("source_health")
    .eq("id", 1)
    .maybeSingle();

  const health = (data?.source_health as SourceHealthMap | null) ?? {};
  health[source] = {
    lastSuccess: new Date().toISOString(),
    lastError: null,
    failCount: 0,
  };

  await supabase.from("job_sync_meta").update({ source_health: health }).eq("id", 1);
  logger.info("Job source OK", { source, count });
}

export async function recordSourceFailure(source: string, error: string): Promise<void> {
  const supabase = tryCreateAdminClient();
  if (!supabase) return;

  const { data } = await supabase
    .from("job_sync_meta")
    .select("source_health")
    .eq("id", 1)
    .maybeSingle();

  const health = (data?.source_health as SourceHealthMap | null) ?? {};
  const prev = health[source] ?? { lastSuccess: null, lastError: null, failCount: 0 };
  health[source] = {
    lastSuccess: prev.lastSuccess,
    lastError: error.slice(0, 500),
    failCount: prev.failCount + 1,
  };

  await supabase.from("job_sync_meta").update({ source_health: health }).eq("id", 1);
  logger.warn("Job source failed", { source, error });
}

export async function markSyncSuccess(newJobsCount: number): Promise<void> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const updates: Record<string, unknown> = {
    last_synced_at: now,
    sync_in_progress: false,
    sync_started_at: null,
    consecutive_failures: 0,
    next_retry_at: null,
  };

  if (newJobsCount > 0) {
    updates.last_new_jobs_at = now;
    updates.sync_interval_hours = 1;
  } else {
    const { data } = await supabase
      .from("job_sync_meta")
      .select("sync_interval_hours")
      .eq("id", 1)
      .maybeSingle();
    const current = data?.sync_interval_hours ?? 1;
    updates.sync_interval_hours = Math.min(4, current + 1);
  }

  await supabase.from("job_sync_meta").update(updates).eq("id", 1);
}

export async function markSyncFailure(): Promise<void> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("job_sync_meta")
    .select("consecutive_failures")
    .eq("id", 1)
    .maybeSingle();

  const failures = (data?.consecutive_failures ?? 0) + 1;
  const retryAt = new Date(
    Date.now() + Math.min(failures, 5) * 15 * 60_000
  ).toISOString();

  await supabase
    .from("job_sync_meta")
    .update({
      sync_in_progress: false,
      sync_started_at: null,
      consecutive_failures: failures,
      next_retry_at: retryAt,
    })
    .eq("id", 1);

  if (failures >= 3) {
    await maybeSendAlert("consecutive_failures", `${failures} כשלי סנכron ברצף`);
  }
}

export async function shouldSkipScheduledSync(): Promise<boolean> {
  const supabase = tryCreateAdminClient();
  if (!supabase) return false;

  const { data } = await supabase
    .from("job_sync_meta")
    .select(
      "last_synced_at, sync_interval_hours, next_retry_at, sync_in_progress, sync_started_at"
    )
    .eq("id", 1)
    .maybeSingle();

  if (!data) return false;

  if (data.sync_in_progress && data.sync_started_at) {
    const started = new Date(data.sync_started_at).getTime();
    if (Date.now() - started < 25 * 60_000) return true;
  }

  if (data.next_retry_at) {
    const retry = new Date(data.next_retry_at).getTime();
    if (Date.now() < retry) return true;
  }

  if (!data.last_synced_at) return false;

  const intervalMs = (data.sync_interval_hours ?? 1) * 60 * 60 * 1000;
  const last = new Date(data.last_synced_at).getTime();
  return Date.now() - last < intervalMs;
}

async function maybeSendAlert(kind: string, detail: string): Promise<void> {
  const supabase = tryCreateAdminClient();
  if (!supabase) return;

  const { data } = await supabase
    .from("job_sync_meta")
    .select("last_alert_at, last_new_jobs_at")
    .eq("id", 1)
    .maybeSingle();

  const lastAlert = data?.last_alert_at ? new Date(data.last_alert_at).getTime() : 0;
  if (Date.now() - lastAlert < 6 * 60 * 60 * 1000) return;

  if (kind === "stale_new_jobs" && data?.last_new_jobs_at) {
    const lastNew = new Date(data.last_new_jobs_at).getTime();
    if (Date.now() - lastNew < 24 * 60 * 60 * 1000) return;
  }

  await sendJobSyncAlertEmail(kind, detail);
  await supabase
    .from("job_sync_meta")
    .update({ last_alert_at: new Date().toISOString() })
    .eq("id", 1);
}

export async function checkStaleNewJobsAlert(): Promise<void> {
  const supabase = tryCreateAdminClient();
  if (!supabase) return;

  const { data } = await supabase
    .from("job_sync_meta")
    .select("last_new_jobs_at")
    .eq("id", 1)
    .maybeSingle();

  if (!data?.last_new_jobs_at) return;

  const lastNew = new Date(data.last_new_jobs_at).getTime();
  if (Date.now() - lastNew > 24 * 60 * 60 * 1000) {
    await maybeSendAlert("stale_new_jobs", "לא נוספו משרות חדשות מ-24 שעות");
  }
}

export async function acquireSyncLockAtomic(): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("acquire_job_sync_lock", {
    stuck_minutes: 25,
  });

  if (error) {
    logger.warn("acquire_job_sync_lock RPC failed — fallback", {
      error: error.message,
    });
    return acquireSyncLockFallback();
  }

  return Boolean(data);
}

async function acquireSyncLockFallback(): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("job_sync_meta")
    .select("sync_in_progress, sync_started_at")
    .eq("id", 1)
    .maybeSingle();

  if (data?.sync_in_progress && data.sync_started_at) {
    const started = new Date(data.sync_started_at).getTime();
    if (Date.now() - started < 25 * 60_000) return false;
  }

  const { error } = await supabase
    .from("job_sync_meta")
    .update({
      sync_in_progress: true,
      sync_started_at: new Date().toISOString(),
    })
    .eq("id", 1);

  return !error;
}

export async function getAdaptiveStaleMs(): Promise<number> {
  const supabase = tryCreateAdminClient();
  if (!supabase) return 60 * 60 * 1000;

  const { data } = await supabase
    .from("job_sync_meta")
    .select("sync_interval_hours")
    .eq("id", 1)
    .maybeSingle();

  const hours = data?.sync_interval_hours ?? 1;
  return hours * 60 * 60 * 1000;
}
