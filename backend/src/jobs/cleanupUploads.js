import { readdir, rm, stat } from "node:fs/promises";
import { resolve, relative, join } from "node:path";
import { env } from "../config/env.js";
import { query } from "../config/database.js";

async function walkFiles(directory) {
  let entries = [];
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkFiles(path));
    } else if (entry.isFile()) {
      files.push(path);
    }
  }
  return files;
}

function staysInside(base, target) {
  const relativePath = relative(base, target);
  return relativePath && !relativePath.startsWith("..") && !relativePath.includes(":");
}

export async function cleanupOrphanUploads({ dryRun = true } = {}) {
  const uploadsRoot = resolve(env.UPLOADS_DIR);
  const cutoff = Date.now() - env.UPLOAD_ORPHAN_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const registered = await query("select ruta_relativa from reporte_fotos");
  const registeredPaths = new Set(
    registered.rows.map((row) => resolve(uploadsRoot, row.ruta_relativa))
  );

  const files = await walkFiles(uploadsRoot);
  const candidates = [];

  for (const file of files) {
    const absolute = resolve(file);
    if (!staysInside(uploadsRoot, absolute) || registeredPaths.has(absolute)) continue;
    const fileStat = await stat(absolute);
    if (fileStat.mtimeMs <= cutoff) candidates.push(absolute);
  }

  if (!dryRun) {
    for (const file of candidates) {
      await rm(file, { force: true });
    }
  }

  return {
    dryRun,
    uploadsRoot,
    retentionDays: env.UPLOAD_ORPHAN_RETENTION_DAYS,
    totalFiles: files.length,
    orphanCandidates: candidates.length,
    files: candidates.map((file) => relative(uploadsRoot, file))
  };
}
