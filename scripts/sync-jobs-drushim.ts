/**
 * Sync jobs into Supabase.
 * Local: npm run sync:jobs
 * CI: npm run sync:jobs:ci (GitHub Actions)
 * Production auto: Vercel Cron + GitHub Actions daily
 */
if (
  process.env.ALLOW_INSECURE_TLS === "1" &&
  process.env.CI !== "true" &&
  process.env.GITHUB_ACTIONS !== "true"
) {
  // מקומי בלבד — פרוקסי שמפריע ל-TLS. לא ב-CI/פרודקשן.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

import {
  acquireSyncLockAtomic,
  markSyncFailure,
  markSyncSuccess,
} from "../lib/jobs/sync-health";
import { runJobSync } from "../lib/jobs/run-sync";

async function main(): Promise<void> {
  const acquired = await acquireSyncLockAtomic();
  if (!acquired) {
    console.log("Sync already running — skipped");
    return;
  }

  try {
    const { synced, newJobs, fetchedBySource } = await runJobSync();
    await markSyncSuccess(newJobs);
    console.log(`Synced ${synced} active jobs (${newJobs} new).`, fetchedBySource);
  } catch (err: unknown) {
    await markSyncFailure();
    console.error("Job sync failed:", err);
    process.exit(1);
  }
}

void main();
