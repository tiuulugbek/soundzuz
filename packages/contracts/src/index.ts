import { z } from "zod";

export const locales = ["uz", "ru"] as const;
export const leadTypes = [
  "HEARING_AID_CONSULTATION",
  "PRICE_REQUEST",
  "APPOINTMENT_REQUEST",
  "IEM_CONSULTATION",
  "GENERAL_CONTACT",
] as const;
export const leadStatuses = [
  "NEW",
  "NEEDS_CONTACT",
  "CONTACTED",
  "APPOINTMENT_BOOKED",
  "FOLLOW_UP",
  "VISITED",
  "SALE_COMPLETED",
  "CANCELLED",
  "INVALID",
] as const;

export const localeSchema = z.enum(locales);
export const leadTypeSchema = z.enum(leadTypes);
export const leadStatusSchema = z.enum(leadStatuses);

export const publicLeadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(32),
  type: leadTypeSchema,
  locale: localeSchema.default("uz"),
  branchId: z.string().trim().min(1).optional(),
  productId: z.string().trim().min(1).optional(),
  serviceId: z.string().trim().min(1).optional(),
  message: z.string().trim().max(2000).optional(),
  preferredAt: z.coerce.date().optional(),
  sourceUrl: z.string().url().max(2048).optional(),
  referrer: z.string().url().max(2048).optional(),
  utmSource: z.string().trim().max(160).optional(),
  utmMedium: z.string().trim().max(160).optional(),
  utmCampaign: z.string().trim().max(160).optional(),
  utmContent: z.string().trim().max(160).optional(),
  utmTerm: z.string().trim().max(160).optional(),
  consent: z.literal(true),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
});

export const updateLeadStatusSchema = z.object({
  status: leadStatusSchema,
  note: z.string().trim().max(2000).optional(),
});

export const createLeadNoteSchema = z.object({
  body: z.string().trim().min(1).max(4000),
});

export type PublicLeadInput = z.infer<typeof publicLeadSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;
export type CreateLeadNoteInput = z.infer<typeof createLeadNoteSchema>;

export function normalizeUzbekPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 9) return `998${digits}`;
  if (digits.length === 12 && digits.startsWith("998")) return digits;
  if (digits.length === 13 && digits.startsWith("0998")) return digits.slice(1);
  throw new Error("Telefon raqami +998XXXXXXXXX formatida bo‘lishi kerak");
}

export const appointmentStatuses = [
  "PENDING",
  "CONFIRMED",
  "CONTACTED",
  "ARRIVED",
  "NO_SHOW",
  "CANCELLED",
  "RESCHEDULED",
  "COMPLETED",
] as const;

export const appointmentStatusSchema = z.enum(appointmentStatuses);

export const publicAppointmentSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(32),
  branchId: z.string().trim().min(1),
  serviceId: z.string().trim().min(1),
  startsAt: z.string().datetime({ offset: true }),
  locale: localeSchema.default("uz"),
  message: z.string().trim().max(2000).optional(),
  sourceUrl: z.string().url().max(2048).optional(),
  referrer: z.string().url().max(2048).optional(),
  utmSource: z.string().trim().max(160).optional(),
  utmMedium: z.string().trim().max(160).optional(),
  utmCampaign: z.string().trim().max(160).optional(),
  consent: z.literal(true),
});

export const updateAppointmentStatusSchema = z.object({
  status: appointmentStatusSchema,
  note: z.string().trim().max(2000).optional(),
});

export type PublicAppointmentInput = z.infer<typeof publicAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;

export const branchInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  phone: z.string().trim().max(32).optional(),
  address: z.string().trim().max(500).optional(),
  isActive: z.boolean().default(true),
});

export const serviceInputSchema = z.object({
  code: z.string().trim().min(2).max(80).regex(/^[A-Z0-9_]+$/),
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1000).optional(),
  durationMinutes: z.number().int().min(10).max(240).default(30),
  isActive: z.boolean().default(true),
});

export const branchSchedulesInputSchema = z.object({
  items: z.array(z.object({
    weekday: z.number().int().min(0).max(6),
    openMinute: z.number().int().min(0).max(1439),
    closeMinute: z.number().int().min(1).max(1440),
    isClosed: z.boolean().default(false),
  }).refine((item) => item.isClosed || item.openMinute < item.closeMinute, {
    message: "Ochilish va yopilish vaqtlarini tekshiring",
  })).min(1).max(7),
});

export const branchServiceInputSchema = z.object({
  isActive: z.boolean().default(true),
});

export type BranchInput = z.infer<typeof branchInputSchema>;
export type ServiceInput = z.infer<typeof serviceInputSchema>;
export type BranchSchedulesInput = z.infer<typeof branchSchedulesInputSchema>;
