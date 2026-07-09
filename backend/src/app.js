import { apiReference } from "@scalar/express-api-reference";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { openApiDocument } from "./docs/openapi.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { generalRateLimiter, authRateLimiter } from "./middlewares/rateLimiters.js";
import { requestContext } from "./middlewares/requestContext.js";
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
import { spatialStatisticsRoutes } from "./routes/spatialStatisticsRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";

function corsOrigin(origin, callback) {
  const allowedOrigins = env.CORS_ORIGIN.split(",").map((value) => value.trim()).filter(Boolean);
  const isAllowed = allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin === origin) return true;
    if (!allowedOrigin.includes("*")) return false;
    const pattern = new RegExp(`^${allowedOrigin.split("*").map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*")}$`);
    return pattern.test(origin);
  });

  if (!origin || isAllowed) {
    callback(null, true);
    return;
  }
  callback(new Error("Origen CORS no permitido."));
}

export function createApp(options = {}) {
  const app = express();

  app.locals.repositories = {
    user: options.userRepository ?? userRepository
  };
  app.locals.firebaseAuth = options.firebaseAuth ?? null;

  app.use(requestContext);
  app.use(helmet());
  app.use(cors({ origin: corsOrigin, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser(env.ADMIN_SESSION_SECRET));
  app.use(generalRateLimiter);
  app.use("/admin/login", authRateLimiter);

  if (env.NODE_ENV !== "test") {
    morgan.token("id", (req) => req.id);
    app.use(morgan(":id :remote-addr :method :url :status :res[content-length] - :response-time ms"));
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
  app.use(spatialStatisticsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
