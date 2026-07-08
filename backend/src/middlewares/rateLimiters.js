import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

const commonOptions = {
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  standardHeaders: "draft-8",
  legacyHeaders: false
};

export const generalRateLimiter = rateLimit({
  ...commonOptions,
  limit: env.RATE_LIMIT_MAX,
  message: { message: "Demasiadas solicitudes. Intenta nuevamente mas tarde." }
});

export const authRateLimiter = rateLimit({
  ...commonOptions,
  limit: env.AUTH_RATE_LIMIT_MAX,
  skipSuccessfulRequests: true,
  message: { message: "Demasiados intentos de acceso. Intenta nuevamente mas tarde." }
});
