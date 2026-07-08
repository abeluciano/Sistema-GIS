import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const requiredPaths = [
  ".gitignore",
  ".env.example",
  "package.json",
  "README.md",
  "backend/package.json",
  "backend/.env.example",
  "backend/scripts/db-check.mjs",
  "backend/scripts/db-migrate.mjs",
  "backend/scripts/seed-admin.mjs",
  "backend/src/app.js",
  "backend/src/server.js",
  "backend/src/config/env.js",
  "backend/src/config/database.js",
  "backend/src/config/firebase.js",
  "backend/src/middlewares/errorHandler.js",
  "backend/src/middlewares/authAdmin.js",
  "backend/src/middlewares/authFirebase.js",
  "backend/src/middlewares/requireRole.js",
  "backend/src/middlewares/validate.js",
  "backend/src/routes/healthRoutes.js",
  "backend/src/routes/adminAuthRoutes.js",
  "backend/src/routes/firebaseAuthRoutes.js",
  "backend/src/routes/firebaseSyncRoutes.js",
  "backend/src/routes/userRoutes.js",
  "backend/src/routes/catalogRoutes.js",
  "backend/src/routes/reportRoutes.js",
  "backend/src/routes/photoRoutes.js",
  "backend/src/routes/indicatorRoutes.js",
  "backend/src/routes/gisRoutes.js",
  "backend/src/routes/exportRoutes.js",
  "backend/src/routes/statisticsRoutes.js",
  "backend/src/controllers/healthController.js",
  "backend/src/controllers/adminAuthController.js",
  "backend/src/controllers/firebaseAuthController.js",
  "backend/src/controllers/firebaseSyncController.js",
  "backend/src/services/adminAuthService.js",
  "backend/src/services/statisticsService.js",
  "backend/src/repositories/userRepository.js",
  "backend/src/validators/adminSchemas.js",
  "backend/src/jobs/.gitkeep",
  "backend/src/utils/httpError.js",
  "backend/src/utils/asyncHandler.js",
  "backend/src/docs/openapi.js",
  "backend/uploads/.gitkeep",
  "backend/tests/health.test.js",
  "backend/tests/adminAuth.test.js",
  "backend/tests/firebaseAuth.test.js",
  "backend/tests/statisticsService.test.js",
  "dashboard/package.json",
  "dashboard/.env.example",
  "dashboard/index.html",
  "dashboard/tsconfig.json",
  "dashboard/vite.config.ts",
  "dashboard/src/App.tsx",
  "dashboard/src/main.tsx",
  "dashboard/src/components/ChartsPanel.tsx",
  "dashboard/src/components/FiltersBar.tsx",
  "dashboard/src/components/KpiGrid.tsx",
  "dashboard/src/components/LoginPanel.tsx",
  "dashboard/src/components/MapPanel.tsx",
  "dashboard/src/components/ReportsTable.tsx",
  "dashboard/src/components/StatisticalAnalysisPanel.tsx",
  "dashboard/src/components/StatisticalAnalysisPanel.test.tsx",
  "dashboard/src/firebase/config.ts",
  "dashboard/src/services/api.ts",
  "dashboard/src/test/setup.ts",
  "dashboard/src/theme/dashboard.css",
  "mobile/package.json",
  "mobile/.env.example",
  "mobile/capacitor.config.ts",
  "mobile/index.html",
  "mobile/tsconfig.json",
  "mobile/vite.config.ts",
  "mobile/src/App.tsx",
  "mobile/src/main.tsx",
  "mobile/src/components/AppLogo.tsx",
  "mobile/src/firebase/config.ts",
  "mobile/src/hooks/useAuth.tsx",
  "mobile/src/pages/DetailReportPage.tsx",
  "mobile/src/pages/EmergencyPage.tsx",
  "mobile/src/pages/HomePage.tsx",
  "mobile/src/pages/MyReportsPage.tsx",
  "mobile/src/pages/NewReportPage.tsx",
  "mobile/src/pages/WelcomePage.tsx",
  "mobile/src/pages/WelcomePage.test.tsx",
  "mobile/src/services/api.ts",
  "mobile/src/test/setup.ts",
  "mobile/src/theme/app.css",
  "database/schema.sql",
  "database/check-schema.sql",
  "database/migrations/001_initial_schema.sql",
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
