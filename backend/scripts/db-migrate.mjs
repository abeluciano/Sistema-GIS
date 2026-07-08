import "dotenv/config";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { Client } from "pg";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required. Copy backend/.env.example to backend/.env or export it locally.");
  process.exit(1);
}

const migrationsDir = resolve(process.cwd(), "..", "database", "migrations");
const migrationFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false }
});

await client.connect();

try {
  await client.query(`
    create table if not exists schema_migrations (
      id text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  for (const file of migrationFiles) {
    const alreadyApplied = await client.query(
      "select exists(select 1 from schema_migrations where id = $1) as applied",
      [file]
    );

    if (alreadyApplied.rows[0]?.applied) {
      console.log(`Skipping ${file}; already applied.`);
      continue;
    }

    const sql = readFileSync(join(migrationsDir, file), "utf8");

    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into schema_migrations (id) values ($1)", [file]);
      await client.query("commit");
      console.log(`Applied ${file}`);
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }
} finally {
  await client.end();
}
