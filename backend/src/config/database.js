import pg from "pg";
import { env } from "./env.js";

let pool;

export function getPool() {
  if (!env.DATABASE_URL) return null;

  if (!pool) {
    pool = new pg.Pool({
      connectionString: env.DATABASE_URL,
      ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false }
    });
  }

  return pool;
}

export async function query(text, params = []) {
  const activePool = getPool();
  if (!activePool) throw new Error("DATABASE_URL is not configured.");
  return activePool.query(text, params);
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
