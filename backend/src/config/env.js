import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().optional(),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  JWT_ACCESS_SECRET: z.string().min(16).default("dev-only-change-this-secret"),
  ADMIN_SESSION_SECRET: z.string().min(16).default("dev-only-change-session-secret"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(8).max(14).default(12),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  UPLOADS_DIR: z.string().default("backend/uploads"),
  MAX_REPORT_PHOTOS: z.coerce.number().int().min(1).max(3).default(3),
  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(5)
});

export const env = envSchema.parse(process.env);
