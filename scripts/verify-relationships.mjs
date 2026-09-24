import fs from "node:fs";
import postgres from "postgres";
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());
const url =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL;
if (!url) throw new Error("No configured database URL");
const host = new URL(url).hostname;
console.log("Database host:", host);
const sql = postgres(url, {
  prepare: false,
  max: 1,
  connect_timeout: 15,
  onnotice: () => {},
});
try {
  await sql.begin(async (tx) => {
    await tx.unsafe(fs.readFileSync("scripts/relationships.sql", "utf8"));
  });
  await sql.begin(async (tx) => {
    await tx.unsafe(fs.readFileSync("scripts/relationships.sql", "utf8"));
  });
  const columns =
    await sql`SELECT table_name,column_name,data_type,is_nullable,column_default FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('trainer_assignments','sponsor_sponsorships') ORDER BY table_name,ordinal_position`;
  const constraints =
    await sql`SELECT conrelid::regclass::text AS table_name, conname, pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid IN ('trainer_assignments'::regclass,'sponsor_sponsorships'::regclass) ORDER BY conname`;
  const indexes =
    await sql`SELECT tablename,indexname,indexdef FROM pg_indexes WHERE tablename IN ('trainer_assignments','sponsor_sponsorships') ORDER BY indexname`;
  const security =
    await sql`SELECT relname,relrowsecurity FROM pg_class WHERE oid IN ('trainer_assignments'::regclass,'sponsor_sponsorships'::regclass)`;
  const result = {
    verifiedAt: new Date().toISOString(),
    host,
    migrationRuns: 2,
    columns,
    constraints,
    indexes,
    security,
  };
  fs.mkdirSync("docs/verification", { recursive: true });
  fs.writeFileSync(
    "docs/verification/relationships-schema.json",
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result, null, 2));
} finally {
  await sql.end();
}
