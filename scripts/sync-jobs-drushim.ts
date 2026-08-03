/**
 * Sync real job listings from Drushim.co.il into Supabase.
 * Run: npm run sync:jobs
 * (בפרודקשן רץ אוטומטית פעם ביום דרך Vercel Cron — ראו vercel.json)
 */
// הערה: מכונת הפיתוח המקומית מריצה פרוקסי שמיירט TLS, ולכן אימות תעודות נכשל.
// העקיפה חלה על סקריפטים מקומיים בלבד — קוד הפרודקשן לא מבטל אימות TLS.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { runJobSync } from "../lib/jobs/run-sync";

runJobSync()
  .then(({ synced }) => {
    console.log(`Synced ${synced} real Drushim jobs. Old seed jobs deactivated.`);
  })
  .catch((err: unknown) => {
    console.error("Job sync failed:", err);
    process.exit(1);
  });
