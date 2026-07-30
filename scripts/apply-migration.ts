/**
 * Apply pending SQL migrations via direct Postgres connection.
 * Requires DATABASE_URL in .env.local (Supabase → Settings → Database → Connection string)
 * Run: npm run migrate
 */
import { readFileSync } from "fs";
import { join } from "path";

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

  const { Client } = await import("pg");
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  const sqlPath = join(
    process.cwd(),
    "supabase/migrations/002_profiles_insert_policy.sql"
  );
  const sql = readFileSync(sqlPath, "utf8");

  await client.connect();
  console.log("Applying 002_profiles_insert_policy.sql...");
  await client.query(sql);
  await client.end();
  console.log("✓ Migration applied");
}

main().catch((err) => {
  console.error("Migration failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
