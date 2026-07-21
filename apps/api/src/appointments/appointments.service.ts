import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { normalizeUzbekPhone, type PublicAppointmentInput, type UpdateAppointmentStatusInput } from "@soundz/contracts";
import type { AppointmentStatus, PrismaClient } from "@soundz/database";
import { PRISMA } from "../prisma/prisma.module.js";

interface RequestMetadata {
  idempotencyKey?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface AdminListInput {
  page: number;
  limit: number;
  status?: AppointmentStatus;
  dateFrom?: string;
  dateTo?: string;
}

function appointmentReference(): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `AP-${date}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function leadReference(): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `SZ-${date}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function dateParts(date: string): { year: number; month: number; day: number } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new ConflictException("Sana YYYY-MM-DD formatida bo‘lishi kerak");
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) throw new ConflictException("Sana noto‘g‘ri");
  return { year, month, day };
}

function slotDate(date: string, minute: number): Date {
  const hour = Math.floor(minute / 60);
  const min = minute % 60;
  return new Date(`${date}T${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:00+05:00`);
}

@Injectable()
export class AppointmentsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async listBranches(): Promise<object> {
    const items = await this.prisma.branch.findMany({
      where: { isActive: true, services: { some: { isActive: true, service: { isActive: true } } } },
      select: { id: true, name: true, slug: true, phone: true, address: true },
      orderBy: { name: "asc" },
    });
    return { items };
  }

  async listServices(branchId: string): Promise<object> {
    const items = await this.prisma.branchService.findMany({
      where: { branchId, isActive: true, service: { isActive: true } },
      include: { service: true },
      orderBy: { service: { name: "asc" } },
    });
    return {
      items: items.map(({ service, slotCapacity }) => ({
        id: service.id,
        code: service.code,
        name: service.name,
        description: service.description,
        durationMinutes: service.durationMinutes,
        slotCapacity,
      })),
    };
  }

  async getAvailableSlots(branchId: string, serviceId: string, date: string): Promise<object> {
    const { year, month, day } = dateParts(date);
    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    const dateOnly = new Date(Date.UTC(year, month - 1, day));

    const [branchService, schedule, closure] = await Promise.all([
      this.prisma.branchService.findUnique({
        where: { branchId_serviceId: { branchId, serviceId } },
        include: { service: true, branch: true },
      }),
      this.prisma.branchSchedule.findUnique({ where: { branchId_weekday: { branchId, weekday } } }),
      this.prisma.branchClosure.findUnique({ where: { branchId_date: { branchId, date: dateOnly } } }),
    ]);

    if (!branchService?.isActive || !branchService.service.isActive || !branchService.branch.isActive) {
      throw new NotFoundException("Filial yoki xizmat mavjud emas");
    }
    if (!schedule || schedule.isClosed || closure) return { date, items: [] };

    const duration = branchService.service.durationMinutes;
    const rangeStart = slotDate(date, schedule.openMinute);
    const rangeEnd = slotDate(date, schedule.closeMinute);
    const booked = await this.prisma.appointment.findMany({
      where: {
        branchId,
        serviceId,
        startsAt: { gte: rangeStart, lt: rangeEnd },
        status: { notIn: ["CANCELLED", "RESCHEDULED"] },
      },
      select: { startsAt: true },
    });
    const bookedTimes = new Set(booked.map((item) => item.startsAt.toISOString()));
    const now = new Date();
    const items: Array<{ startsAt: string; endsAt: string }> = [];

    for (let minute = schedule.openMinute; minute + duration <= schedule.closeMinute; minute += duration) {
      const startsAt = slotDate(date, minute);
      const endsAt = slotDate(date, minute + duration);
      if (startsAt <= now || bookedTimes.has(startsAt.toISOString())) continue;
      items.push({ startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() });
    }
    return { date, branchId, serviceId, timezone: "Asia/Tashkent", items };
  }

  async createPublicAppointment(input: PublicAppointmentInput, metadata: RequestMetadata): Promise<object> {
    const normalizedPhone = normalizeUzbekPhone(input.phone);
    const startsAt = new Date(input.startsAt);
    const cleanIdempotencyKey = metadata.idempotencyKey?.trim().slice(0, 160);

    if (cleanIdempotencyKey) {
      const existing = await this.prisma.appointment.findUnique({
        where: { idempotencyKey: cleanIdempotencyKey },
        include: { branch: true, service: true },
      });
      if (existing) return this.publicResponse(existing);
    }

    const date = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tashkent",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(startsAt);
    const available = await this.getAvailableSlots(input.branchId, input.serviceId, date) as { items: Array<{ startsAt: string; endsAt: string }> };
    const selected = available.items.find((slot) => slot.startsAt === startsAt.toISOString());
    if (!selected) throw new ConflictException("Tanlangan vaqt endi bo‘sh emas. Boshqa vaqtni tanlang.");

    try {
      const appointment = await this.prisma.$transaction(async (tx) => {
        const contact = await tx.contact.upsert({
          where: { normalizedPhone },
          update: { name: input.name, displayPhone: input.phone },
          create: { name: input.name, normalizedPhone, displayPhone: input.phone },
        });
        const lead = await tx.lead.create({
          data: {
            publicReference: leadReference(),
            contactId: contact.id,
            type: "APPOINTMENT_REQUEST",
            status: "APPOINTMENT_BOOKED",
            locale: input.locale,
            branchId: input.branchId,
            serviceId: input.serviceId,
            message: input.message,
            preferredAt: startsAt,
            sourceUrl: input.sourceUrl,
            referrer: input.referrer,
            utmSource: input.utmSource,
            utmMedium: input.utmMedium,
            utmCampaign: input.utmCampaign,
            statusHistory: {
              create: [
                { toStatus: "NEW", note: "Public appointment form submission" },
                { fromStatus: "NEW", toStatus: "APPOINTMENT_BOOKED", note: "Appointment created" },
              ],
            },
          },
        });
        const created = await tx.appointment.create({
          data: {
            publicReference: appointmentReference(),
            idempotencyKey: cleanIdempotencyKey,
            leadId: lead.id,
            contactId: contact.id,
            branchId: input.branchId,
            serviceId: input.serviceId,
            startsAt,
            endsAt: new Date(selected.endsAt),
            status: "PENDING",
            createdBy: "PUBLIC",
            note: input.message,
            statusHistory: { create: { toStatus: "PENDING", note: "Public booking created" } },
          },
          include: { contact: true, branch: true, service: true },
        });

        await tx.outboxEvent.create({
          data: {
            type: "appointment.created",
            aggregateType: "Appointment",
            aggregateId: created.id,
            idempotencyKey: `telegram:appointment.created:${created.id}`,
            payload: {
              appointmentId: created.id,
              publicReference: created.publicReference,
              leadReference: lead.publicReference,
              name: contact.name,
              phone: contact.displayPhone,
              branchName: created.branch.name,
              serviceName: created.service.name,
              startsAt: created.startsAt.toISOString(),
              endsAt: created.endsAt.toISOString(),
              note: created.note,
              utmSource: input.utmSource,
            },
          },
        });
        await tx.auditLog.create({
          data: {
            action: "appointment.public_created",
            entityType: "Appointment",
            entityId: created.id,
            after: { status: created.status, publicReference: created.publicReference, startsAt: created.startsAt.toISOString() },
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent,
          },
        });
        return created;
      }, { isolationLevel: "Serializable" });
      return this.publicResponse(appointment);
    } catch (error: unknown) {
      if (cleanIdempotencyKey) {
        const existing = await this.prisma.appointment.findUnique({
          where: { idempotencyKey: cleanIdempotencyKey },
          include: { branch: true, service: true },
        });
        if (existing) return this.publicResponse(existing);
      }
      throw new ConflictException("Bu vaqt band bo‘lib qoldi. Boshqa vaqtni tanlang.", { cause: error });
    }
  }

  async listAdmin(input: AdminListInput): Promise<object> {
    const startsAt = {
      ...(input.dateFrom ? { gte: new Date(input.dateFrom) } : {}),
      ...(input.dateTo ? { lte: new Date(input.dateTo) } : {}),
    };
    const where = {
      ...(input.status ? { status: input.status } : {}),
      ...(Object.keys(startsAt).length ? { startsAt } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where,
        include: { contact: true, branch: true, service: true, lead: true },
        orderBy: { startsAt: "asc" },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);
    return { items, total, page: input.page, limit: input.limit, pages: Math.ceil(total / input.limit) };
  }

  async getById(id: string): Promise<object> {
    const item = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        contact: true,
        branch: true,
        service: true,
        lead: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!item) throw new NotFoundException("Qabul topilmadi");
    return item;
  }

  async updateStatus(id: string, input: UpdateAppointmentStatusInput, actorUserId: string, metadata: RequestMetadata): Promise<object> {
    const existing = await this.prisma.appointment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Qabul topilmadi");
    if (existing.status === input.status) return this.getById(id);

    await this.prisma.$transaction([
      this.prisma.appointment.update({ where: { id }, data: { status: input.status } }),
      this.prisma.appointmentStatusHistory.create({
        data: { appointmentId: id, fromStatus: existing.status, toStatus: input.status, changedById: actorUserId, note: input.note },
      }),
      this.prisma.auditLog.create({
        data: {
          actorUserId,
          action: "appointment.status_changed",
          entityType: "Appointment",
          entityId: id,
          before: { status: existing.status },
          after: { status: input.status, note: input.note },
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
        },
      }),
    ]);
    return this.getById(id);
  }

  private publicResponse(item: { publicReference: string; status: string; startsAt: Date; branch: { name: string }; service: { name: string } }): object {
    return {
      reference: item.publicReference,
      status: item.status,
      startsAt: item.startsAt,
      branch: item.branch.name,
      service: item.service.name,
      message: "Qabul so‘rovingiz saqlandi. Operator vaqtni tasdiqlash uchun bog‘lanadi.",
    };
  }
}
