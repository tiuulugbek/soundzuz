import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { normalizeUzbekPhone, type PublicLeadInput, type UpdateLeadStatusInput } from "@soundz/contracts";
import type { LeadStatus, PrismaClient } from "@soundz/database";
import { PRISMA } from "../prisma/prisma.module.js";

interface RequestMetadata {
  idempotencyKey?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface ListInput {
  page: number;
  limit: number;
  status?: LeadStatus;
  search?: string;
}

function publicReference(): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `SZ-${date}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

@Injectable()
export class LeadsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async createPublicLead(input: PublicLeadInput, metadata: RequestMetadata): Promise<object> {
    const normalizedPhone = normalizeUzbekPhone(input.phone);
    const cleanIdempotencyKey = metadata.idempotencyKey?.trim().slice(0, 160);

    if (cleanIdempotencyKey) {
      const existing = await this.prisma.lead.findUnique({
        where: { idempotencyKey: cleanIdempotencyKey },
        include: { contact: true, branch: true },
      });
      if (existing) return this.publicResponse(existing);
    }

    try {
      const lead = await this.prisma.$transaction(async (tx) => {
        const contact = await tx.contact.upsert({
          where: { normalizedPhone },
          update: { name: input.name, displayPhone: input.phone },
          create: { name: input.name, normalizedPhone, displayPhone: input.phone },
        });

        const created = await tx.lead.create({
          data: {
            publicReference: publicReference(),
            idempotencyKey: cleanIdempotencyKey,
            contactId: contact.id,
            type: input.type,
            locale: input.locale,
            branchId: input.branchId,
            productId: input.productId,
            serviceId: input.serviceId,
            message: input.message,
            preferredAt: input.preferredAt,
            sourceUrl: input.sourceUrl,
            referrer: input.referrer,
            utmSource: input.utmSource,
            utmMedium: input.utmMedium,
            utmCampaign: input.utmCampaign,
            utmContent: input.utmContent,
            utmTerm: input.utmTerm,
            statusHistory: { create: { toStatus: "NEW", note: "Public form submission" } },
          },
          include: { contact: true, branch: true },
        });

        await tx.outboxEvent.create({
          data: {
            type: "lead.created",
            aggregateType: "Lead",
            aggregateId: created.id,
            idempotencyKey: `telegram:lead.created:${created.id}`,
            payload: {
              leadId: created.id,
              publicReference: created.publicReference,
              name: contact.name,
              phone: contact.displayPhone,
              normalizedPhone,
              type: created.type,
              status: created.status,
              branchName: created.branch?.name ?? null,
              productId: created.productId,
              serviceId: created.serviceId,
              preferredAt: created.preferredAt?.toISOString() ?? null,
              message: created.message,
              sourceUrl: created.sourceUrl,
              utmSource: created.utmSource,
              utmCampaign: created.utmCampaign,
            },
          },
        });

        await tx.auditLog.create({
          data: {
            action: "lead.public_created",
            entityType: "Lead",
            entityId: created.id,
            after: { status: created.status, type: created.type, publicReference: created.publicReference },
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent,
          },
        });

        return created;
      });

      return this.publicResponse(lead);
    } catch (error: unknown) {
      if (cleanIdempotencyKey) {
        const existing = await this.prisma.lead.findUnique({
          where: { idempotencyKey: cleanIdempotencyKey },
          include: { contact: true, branch: true },
        });
        if (existing) return this.publicResponse(existing);
      }
      throw new ConflictException("Murojaatni saqlashda muammo yuz berdi. Qayta urinib ko‘ring.", { cause: error });
    }
  }

  async list(input: ListInput): Promise<object> {
    const where = {
      ...(input.status ? { status: input.status } : {}),
      ...(input.search
        ? {
            OR: [
              { publicReference: { contains: input.search, mode: "insensitive" as const } },
              { contact: { name: { contains: input.search, mode: "insensitive" as const } } },
              { contact: { normalizedPhone: { contains: input.search } } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        include: { contact: true, branch: true, assignedUser: true },
        orderBy: { createdAt: "desc" },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.lead.count({ where }),
    ]);
    return { items, total, page: input.page, limit: input.limit, pages: Math.ceil(total / input.limit) };
  }

  async getById(id: string): Promise<object> {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        contact: true,
        branch: true,
        assignedUser: true,
        notes: { include: { author: true }, orderBy: { createdAt: "desc" } },
        statusHistory: { include: { changedBy: true }, orderBy: { createdAt: "desc" } },
      },
    });
    if (!lead) throw new NotFoundException("Murojaat topilmadi");
    return lead;
  }

  async updateStatus(id: string, input: UpdateLeadStatusInput, actorUserId: string, metadata: RequestMetadata): Promise<object> {
    const existing = await this.prisma.lead.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Murojaat topilmadi");
    if (existing.status === input.status) return this.getById(id);

    await this.prisma.$transaction(async (tx) => {
      await tx.lead.update({ where: { id }, data: { status: input.status } });
      await tx.leadStatusHistory.create({
        data: { leadId: id, fromStatus: existing.status, toStatus: input.status, changedById: actorUserId, note: input.note },
      });
      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "lead.status_changed",
          entityType: "Lead",
          entityId: id,
          before: { status: existing.status },
          after: { status: input.status, note: input.note },
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
        },
      });
    });
    return this.getById(id);
  }

  async addNote(id: string, body: string, actorUserId: string): Promise<object> {
    const lead = await this.prisma.lead.findUnique({ where: { id }, select: { id: true } });
    if (!lead) throw new NotFoundException("Murojaat topilmadi");
    return this.prisma.leadNote.create({
      data: { leadId: id, authorId: actorUserId, body },
      include: { author: true },
    });
  }

  private publicResponse(lead: { id: string; publicReference: string; status: string; createdAt: Date }): object {
    return {
      id: lead.id,
      reference: lead.publicReference,
      status: lead.status,
      createdAt: lead.createdAt,
      message: "Murojaatingiz qabul qilindi. Operator siz bilan bog‘lanadi.",
    };
  }
}
