import { NextResponse } from "next/server";
import {
  ensureSyncLockForCron,
  markJobSyncComplete,
  markJobSyncFailed,
} from "@/lib/jobs/auto-sync";
import { runJobSync } from "@/lib/jobs/run-sync";
import { shouldSkipScheduledSync } from "@/lib/jobs/sync-health";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function getCronSecret(): string | null {
  return process.env.CRON_SECRET?.trim() ?? null;
}

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (!auth) return null;

  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? null;
}

function isVercelCronRequest(request: Request): boolean {
  const userAgent = request.headers.get("user-agent") ?? "";
  return (
    userAgent.includes("vercel-cron") ||
    request.headers.get("x-vercel-cron-schedule") !== null ||
    request.headers.get("x-vercel-cron") === "1"
  );
}

function isAuthorized(request: Request): boolean {
  const secret = getCronSecret();
  if (!secret) return false;
  return getBearerToken(request) === secret;
}

/**
 * מופעל אוטומטית:
 * - Vercel Cron (vercel.json) — פעם ביום (Hobby); רענון בכניסה ללוח
 * - רקע בכניסה ללוח משרות (triggerJobSyncIfStale)
 */
export async function GET(request: Request): Promise<NextResponse> {
  if (!getCronSecret()) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 503 }
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isVercelCron = isVercelCronRequest(request);
  if (isVercelCron && (await shouldSkipScheduledSync())) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "adaptive interval or retry backoff",
    });
  }

  const acquired = await ensureSyncLockForCron();
  if (!acquired) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "sync already running",
    });
  }

  try {
    const { synced, newJobs, fetchedBySource } = await runJobSync();
    await markJobSyncComplete(newJobs);
    return NextResponse.json({
      ok: true,
      synced,
      newJobs,
      /** @deprecated use fetchedBySource — kept for backward compatibility */
      bySource: fetchedBySource,
      fetchedBySource,
    });
  } catch (error) {
    await markJobSyncFailed();
    logger.error("Cron job sync failed", { error: String(error) });
    return NextResponse.json({ error: "Job sync failed" }, { status: 500 });
  }
}
