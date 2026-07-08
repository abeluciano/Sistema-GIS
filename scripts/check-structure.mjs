import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const requiredPaths = [
  ".gitignore",
  ".env.example",
  "package.json",
  "README.md",
  "backend/package.json",
  "backend/.env.example",
  "backend/src/config/.gitkeep",
  "backend/src/middlewares/.gitkeep",
  "backend/src/routes/.gitkeep",
  "backend/src/controllers/.gitkeep",
  "backend/src/services/.gitkeep",
  "backend/src/repositories/.gitkeep",
  "backend/src/validators/.gitkeep",
  "backend/src/jobs/.gitkeep",
  "backend/src/utils/.gitkeep",
  "backend/src/docs/.gitkeep",
  "backend/uploads/.gitkeep",
  "backend/tests/.gitkeep",
  "dashboard/package.json",
  "dashboard/.env.example",
  "dashboard/src/pages/.gitkeep",
  "dashboard/src/components/.gitkeep",
  "dashboard/src/services/.gitkeep",
  "dashboard/src/hooks/.gitkeep",
  "dashboard/src/maps/.gitkeep",
  "dashboard/src/theme/.gitkeep",
  "mobile/package.json",
  "mobile/.env.example",
  "mobile/src/pages/.gitkeep",
  "mobile/src/components/.gitkeep",
  "mobile/src/services/.gitkeep",
  "mobile/src/hooks/.gitkeep",
  "mobile/src/theme/.gitkeep",
  "mobile/src/firebase/.gitkeep",
  "database/schema.sql",
  "database/check-schema.sql",
  "database/migrations/.gitkeep",
  "database/seeders/.gitkeep",
  "docs/arquitectura.md",
  "docs/endpoints.md",
  "docs/pruebas.md",
  "docs/despliegue.md",
  "docs/trazabilidad-tesis.md"
];

const forbiddenPaths = [
  ".env",
  ".env.local",
  "backend/.env",
  "dashboard/.env",
  "dashboard/.env.local",
  "mobile/.env",
  "mobile/google-services.json",
  "google-services.json"
];

const missing = requiredPaths.filter((path) => !existsSync(join(process.cwd(), path)));
const presentForbidden = forbiddenPaths.filter((path) => existsSync(join(process.cwd(), path)));

const gitignore = readFileSync(join(process.cwd(), ".gitignore"), "utf8");
const requiredIgnorePatterns = [
  ".env",
  "google-services.json",
  "firebase-adminsdk*.json",
  "backend/uploads/**",
  "tmp/"
];

const missingIgnorePatterns = requiredIgnorePatterns.filter(
  (pattern) => !gitignore.includes(pattern)
);

if (missing.length > 0 || presentForbidden.length > 0 || missingIgnorePatterns.length > 0) {
  if (missing.length > 0) {
    console.error("Missing required paths:");
    for (const path of missing) console.error(`- ${path}`);
  }

  if (presentForbidden.length > 0) {
    console.error("Forbidden local secret/config paths found:");
    for (const path of presentForbidden) console.error(`- ${path}`);
  }

  if (missingIgnorePatterns.length > 0) {
    console.error("Missing .gitignore patterns:");
    for (const pattern of missingIgnorePatterns) console.error(`- ${pattern}`);
  }

  process.exit(1);
}

console.log("Structure check passed. No local secret placeholders were found in tracked paths.");
