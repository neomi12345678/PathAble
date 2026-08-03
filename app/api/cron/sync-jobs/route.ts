import { NextResponse } from "next/server";
import { runJobSync } from "@/lib/jobs/run-sync";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * מופעל אוטומטית ע"י Vercel Cron (ראו vercel.json).
 * מאובטח באמצעות CRON_SECRET — Vercel שולח Authorization: Bearer <CRON_SECRET>.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 503 }
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { synced } = await runJobSync();
    return NextResponse.json({ ok: true, synced });
  } catch (error) {
    logger.error("Cron job sync failed", { error: String(error) });
    return NextResponse.json({ error: "Job sync failed" }, { status: 500 });
  }
}
