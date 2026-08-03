/**
 * Apply a SQL migration via direct Postgres connection.
 * Requires DATABASE_URL in .env.local (Supabase → Settings → Database → Connection string)
 * Run: npm run migrate                       (applies the latest migration)
 *      npm run migrate -- 002_foo.sql        (applies a specific migration)
 */
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

// הערה: מכונת הפיתוח המקומית מריצה פרוקסי שמיירט TLS, ולכן אימות תעודות נכשל.
// העקיפה חלה על סקריפטים מקומיים בלבד — קוד הפרודקשן לא מבטל אימות TLS.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(
      "Missing DATABASE_URL in .env.local\n" +
        "Supabase → Settings → Database → URI (Session pooler)\n" +
        "Example: postgresql://postgres.[ref]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
    );
    process.exit(1);
  }

  const migrationsDir = join(process.cwd(), "supabase/migrations");
  const requested = process.argv[2];
  const fileName =
    requested ??
    readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort()
      .at(-1);

  if (!fileName) {
    console.error("No migration files found");
    process.exit(1);
  }

  const { Client } = await import("pg");
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  const sql = readFileSync(join(migrationsDir, fileName), "utf8");

  await client.connect();
  console.log(`Applying ${fileName}...`);
  await client.query(sql);
  await client.end();
  console.log("✓ Migration applied");
}

main().catch((err) => {
  console.error("Migration failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
