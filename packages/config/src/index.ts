import { z } from "zod";

export const apiEnvironmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  CORS_ORIGINS: z.string().default("http://localhost:3000,http://localhost:3001"),
  ADMIN_SEED_EMAIL: z.string().email().default("admin@soundz.uz"),
  ADMIN_SEED_PASSWORD: z.string().min(10).default("ChangeMe123!"),
});

export const workerEnvironmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().url(),
  TELEGRAM_BOT_TOKEN: z.string().optional().default(""),
  TELEGRAM_LEADS_CHAT_ID: z.string().optional().default(""),
  OUTBOX_POLL_INTERVAL_MS: z.coerce.number().int().min(1000).default(5000),
});

export type ApiEnvironment = z.infer<typeof apiEnvironmentSchema>;
export type WorkerEnvironment = z.infer<typeof workerEnvironmentSchema>;

export function parseApiEnvironment(input: Record<string, unknown>): ApiEnvironment {
  return apiEnvironmentSchema.parse(input);
}

export function parseWorkerEnvironment(input: Record<string, unknown>): WorkerEnvironment {
  return workerEnvironmentSchema.parse(input);
}
