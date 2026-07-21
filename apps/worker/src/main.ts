import "dotenv/config";
import { Queue, Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import { parseWorkerEnvironment } from "@soundz/config";
import { createPrismaClient, type OutboxEvent } from "@soundz/database";

const env = parseWorkerEnvironment(process.env);
const prisma = createPrismaClient(env.DATABASE_URL);
const redis = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });
const queueName = "soundz-telegram-notifications";
const queue = new Queue(queueName, { connection: redis });

interface LeadCreatedPayload {
  leadId: string;
  publicReference: string;
  name: string;
  phone: string;
  type: string;
  status: string;
  branchName: string | null;
  productId: string | null;
  serviceId: string | null;
  preferredAt: string | null;
  message: string | null;
  sourceUrl: string | null;
  utmSource: string | null;
  utmCampaign: string | null;
}


interface AppointmentCreatedPayload {
  appointmentId: string;
  publicReference: string;
  leadReference: string;
  name: string;
  phone: string;
  branchName: string;
  serviceName: string;
  startsAt: string;
  endsAt: string;
  note: string | null;
  utmSource: string | null;
}
function escapeHtml(value: unknown): string {
  return String(value ?? "-")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatLeadMessage(payload: LeadCreatedPayload): string {
  const typeLabels: Record<string, string> = {
    HEARING_AID_CONSULTATION: "Eshitish moslamasi bo‘yicha maslahat",
    PRICE_REQUEST: "Narxini bilish",
    APPOINTMENT_REQUEST: "Qabulga yozilish",
    IEM_CONSULTATION: "Custom IEM bo‘yicha maslahat",
    GENERAL_CONTACT: "Umumiy murojaat",
  };

  return [
    "🔔 <b>Yangi Soundz murojaati</b>",
    "",
    `<b>Raqam:</b> ${escapeHtml(payload.publicReference)}`,
    `<b>Mijoz:</b> ${escapeHtml(payload.name)}`,
    `<b>Telefon:</b> ${escapeHtml(payload.phone)}`,
    `<b>Yo‘nalish:</b> ${escapeHtml(typeLabels[payload.type] ?? payload.type)}`,
    `<b>Filial:</b> ${escapeHtml(payload.branchName)}`,
    `<b>Qabul vaqti:</b> ${escapeHtml(payload.preferredAt)}`,
    `<b>Izoh:</b> ${escapeHtml(payload.message)}`,
    `<b>Manba:</b> ${escapeHtml(payload.utmSource ?? payload.sourceUrl)}`,
  ].join("\n");
}


function formatAppointmentMessage(payload: AppointmentCreatedPayload): string {
  const startsAt = new Intl.DateTimeFormat("uz-UZ", {
    timeZone: "Asia/Tashkent",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(payload.startsAt));
  return [
    "📅 <b>Yangi Soundz qabuli</b>",
    "",
    `<b>Qabul raqami:</b> ${escapeHtml(payload.publicReference)}`,
    `<b>Mijoz:</b> ${escapeHtml(payload.name)}`,
    `<b>Telefon:</b> ${escapeHtml(payload.phone)}`,
    `<b>Filial:</b> ${escapeHtml(payload.branchName)}`,
    `<b>Xizmat:</b> ${escapeHtml(payload.serviceName)}`,
    `<b>Vaqt:</b> ${escapeHtml(startsAt)}`,
    `<b>Izoh:</b> ${escapeHtml(payload.note)}`,
    `<b>Manba:</b> ${escapeHtml(payload.utmSource)}`,
  ].join("\n");
}
async function sendTelegram(event: OutboxEvent): Promise<string> {
  const text = event.type === "appointment.created"
    ? formatAppointmentMessage(event.payload as unknown as AppointmentCreatedPayload)
    : formatLeadMessage(event.payload as unknown as LeadCreatedPayload);

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_LEADS_CHAT_ID) {
    if (env.NODE_ENV === "production") {
      throw new Error("Telegram credentials are required in production");
    }
    console.log("\n--- TELEGRAM PREVIEW ---\n" + text.replace(/<[^>]+>/g, "") + "\n------------------------\n");
    return `preview-${event.id}`;
  }

  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_LEADS_CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  const result = (await response.json()) as { ok?: boolean; description?: string; result?: { message_id?: number } };
  if (!response.ok || !result.ok) {
    throw new Error(`Telegram API error: ${result.description ?? response.statusText}`);
  }
  return String(result.result?.message_id ?? "unknown");
}

async function dispatchOutbox(): Promise<void> {
  const staleBefore = new Date(Date.now() - 10 * 60_000);
  await prisma.outboxEvent.updateMany({
    where: {
      status: { in: ["QUEUED", "PROCESSING"] },
      lockedAt: { lt: staleBefore },
      processedAt: null,
    },
    data: { status: "FAILED", lockedAt: null, lastError: "Recovered stale outbox lock" },
  });

  const events = await prisma.outboxEvent.findMany({
    where: {
      status: { in: ["PENDING", "FAILED"] },
      availableAt: { lte: new Date() },
      attempts: { lt: 10 },
    },
    orderBy: { createdAt: "asc" },
    take: 25,
  });

  for (const event of events) {
    const claimed = await prisma.outboxEvent.updateMany({
      where: { id: event.id, status: { in: ["PENDING", "FAILED"] } },
      data: { status: "QUEUED", lockedAt: new Date() },
    });
    if (claimed.count !== 1) continue;

    try {
      await queue.add(
        event.type,
        { eventId: event.id },
        {
          jobId: event.id,
          attempts: 5,
          backoff: { type: "exponential", delay: 5_000 },
          removeOnComplete: 500,
          removeOnFail: 1000,
        },
      );
    } catch (error: unknown) {
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: "FAILED",
          lockedAt: null,
          availableAt: new Date(Date.now() + 10_000),
          lastError: error instanceof Error ? error.message.slice(0, 4000) : String(error).slice(0, 4000),
        },
      });
    }
  }
}

const worker = new Worker(
  queueName,
  async (job: Job<{ eventId: string }>) => {
    const event = await prisma.outboxEvent.findUnique({ where: { id: job.data.eventId } });
    if (!event) return;
    if (event.status === "COMPLETED") return;

    await prisma.outboxEvent.update({
      where: { id: event.id },
      data: { status: "PROCESSING", attempts: { increment: 1 }, lastError: null },
    });

    try {
      if (!["lead.created", "appointment.created"].includes(event.type)) {
        throw new Error(`Unsupported outbox event: ${event.type}`);
      }
      const providerMessageId = await sendTelegram(event);
      const destination = env.TELEGRAM_LEADS_CHAT_ID || "development-preview";

      await prisma.$transaction([
        prisma.notificationDelivery.upsert({
          where: {
            outboxEventId_channel_destination: {
              outboxEventId: event.id,
              channel: "TELEGRAM",
              destination,
            },
          },
          update: {
            status: "SENT",
            providerMessageId,
            attempts: { increment: 1 },
            sentAt: new Date(),
            lastError: null,
          },
          create: {
            outboxEventId: event.id,
            channel: "TELEGRAM",
            destination,
            status: "SENT",
            providerMessageId,
            attempts: 1,
            sentAt: new Date(),
          },
        }),
        prisma.outboxEvent.update({
          where: { id: event.id },
          data: { status: "COMPLETED", processedAt: new Date(), lockedAt: null, lastError: null },
        }),
      ]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const isFinalAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: isFinalAttempt ? "DEAD" : "FAILED",
          lastError: message.slice(0, 4000),
          lockedAt: null,
          availableAt: new Date(Date.now() + Math.min(60 * 60_000, 5_000 * 2 ** job.attemptsMade)),
        },
      });
      throw error;
    }
  },
  { connection: redis, concurrency: 5 },
);

worker.on("completed", (job) => console.log(`Notification completed: ${job.id}`));
worker.on("failed", (job, error) => console.error(`Notification failed: ${job?.id}`, error.message));

const timer = setInterval(() => {
  dispatchOutbox().catch((error: unknown) => console.error("Outbox dispatch error", error));
}, env.OUTBOX_POLL_INTERVAL_MS);
timer.unref();

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}; shutting down worker`);
  clearInterval(timer);
  await worker.close();
  await queue.close();
  await redis.quit();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

await prisma.$connect();
await dispatchOutbox();
console.log("Soundz notification worker started");
