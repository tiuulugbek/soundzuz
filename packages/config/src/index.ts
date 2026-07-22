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
  MEDIA_STORAGE_DRIVER: z.enum(["local", "s3", "r2"]).default("local"),
  MEDIA_STORAGE_PATH: z.string().default("./storage/media"),
  MEDIA_S3_ENDPOINT: z.string().url().optional(),
  MEDIA_S3_REGION: z.string().default("auto"),
  MEDIA_S3_BUCKET: z.string().optional(),
  MEDIA_S3_ACCESS_KEY_ID: z.string().optional(),
  MEDIA_S3_SECRET_ACCESS_KEY: z.string().optional(),
  MEDIA_PUBLIC_BASE_URL: z.string().url().optional(),
}).superRefine((env, ctx) => {
  if (env.MEDIA_STORAGE_DRIVER === "local") return;
  const required: Array<keyof typeof env> = [
    "MEDIA_S3_ENDPOINT",
    "MEDIA_S3_BUCKET",
    "MEDIA_S3_ACCESS_KEY_ID",
    "MEDIA_S3_SECRET_ACCESS_KEY",
    "MEDIA_PUBLIC_BASE_URL",
  ];
  for (const field of required) {
    if (!env[field]) ctx.addIssue({ code: "custom", path: [field], message: `${field} is required for S3/R2 storage` });
  }
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
