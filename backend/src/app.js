import { apiReference } from "@scalar/express-api-reference";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { openApiDocument } from "./docs/openapi.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { userRepository } from "./repositories/userRepository.js";
import { adminAuthRoutes } from "./routes/adminAuthRoutes.js";
import { catalogRoutes } from "./routes/catalogRoutes.js";
import { exportRoutes } from "./routes/exportRoutes.js";
import { gisRoutes } from "./routes/gisRoutes.js";
import { firebaseAuthRoutes } from "./routes/firebaseAuthRoutes.js";
import { firebaseSyncRoutes } from "./routes/firebaseSyncRoutes.js";
import { healthRoutes } from "./routes/healthRoutes.js";
import { photoRoutes } from "./routes/photoRoutes.js";
import { reportRoutes } from "./routes/reportRoutes.js";
import { indicatorRoutes } from "./routes/indicatorRoutes.js";
import { statisticsRoutes } from "./routes/statisticsRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";

export function createApp(options = {}) {
  const app = express();

  app.locals.repositories = {
    user: options.userRepository ?? userRepository
  };
  app.locals.firebaseAuth = options.firebaseAuth ?? null;

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser(env.ADMIN_SESSION_SECRET));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

  if (env.NODE_ENV !== "test") {
    app.use(morgan("combined"));
  }

  app.get("/openapi.json", (_req, res) => res.json(openApiDocument));
  app.use("/docs", apiReference({ content: openApiDocument }));

  app.use(healthRoutes);
  app.use(adminAuthRoutes);
  app.use(firebaseAuthRoutes);
  app.use(firebaseSyncRoutes);
  app.use(userRoutes);
  app.use(catalogRoutes);
  app.use(reportRoutes);
  app.use(photoRoutes);
  app.use(indicatorRoutes);
  app.use(gisRoutes);
  app.use(exportRoutes);
  app.use(statisticsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
