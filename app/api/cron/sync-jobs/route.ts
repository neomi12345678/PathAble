import { NextResponse } from "next/server";
import {
  ensureSyncLockForCron,
  markJobSyncComplete,
  markJobSyncFailed,
} from "@/lib/jobs/auto-sync";
import { runJobSync } from "@/lib/jobs/run-sync";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  // Vercel Cron שולח header זה
  return request.headers.get("x-vercel-cron") === "1" && Boolean(secret);
}

/**
 * מופעל אוטומטית:
 * - Vercel Cron (vercel.json) — כל 4 שעות
 * - רקע בכניסה ללוח משרות (triggerJobSyncIfStale)
 */
export async function GET(request: Request): Promise<NextResponse> {
  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 503 }
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const acquired = await ensureSyncLockForCron();
  if (!acquired) {
    return NextResponse.json({ ok: true, skipped: true, reason: "sync already running" });
  }

  try {
    const { synced, bySource } = await runJobSync();
    await markJobSyncComplete();
    return NextResponse.json({ ok: true, synced, bySource });
  } catch (error) {
    await markJobSyncFailed();
    logger.error("Cron job sync failed", { error: String(error) });
    return NextResponse.json({ error: "Job sync failed" }, { status: 500 });
  }
}
