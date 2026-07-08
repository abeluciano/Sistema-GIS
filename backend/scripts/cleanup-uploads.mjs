import { cleanupOrphanUploads } from "../src/jobs/cleanupUploads.js";

const apply = process.argv.includes("--apply");

const result = await cleanupOrphanUploads({ dryRun: !apply });
console.log(JSON.stringify(result, null, 2));

if (!apply && result.orphanCandidates > 0) {
  console.log("Dry run activo. Ejecuta con --apply para eliminar archivos huerfanos.");
}
