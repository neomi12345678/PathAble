/**
 * Check Supabase connection and schema.
 * Run: npm run check:supabase
 */
// הערה: מכונת הפיתוח המקומית מריצה פרוקסי שמיירט TLS, ולכן אימות תעודות נכשל.
// העקיפה חלה על סקריפטים מקומיים בלבד — קוד הפרודקשן לא מבטל אימות TLS.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { getSupabaseHealthStatus } from "../lib/supabase/health";

async function main(): Promise<void> {
  const status = await getSupabaseHealthStatus();

  console.log("\n=== PathAble · Supabase ===\n");
  console.log(`Configured:  ${status.configured ? "yes" : "no"}`);
  console.log(`Connected:   ${status.connected ? "yes" : "no"}`);
  console.log(`Tables:      ${status.tablesReady ? "yes" : "no"}`);
  if (status.professionsCount !== null) {
    console.log(`Professions: ${status.professionsCount}`);
  }
  if (status.error) {
    console.log(`\n⚠ ${status.error}`);
  } else {
    console.log("\n✓ Supabase מחובר ומוכן");
  }
  console.log("");

  if (!status.configured || status.error) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
