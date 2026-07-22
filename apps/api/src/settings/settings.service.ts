import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { BranchInput, BranchSchedulesInput, ServiceInput } from "@soundz/contracts";
import type { PrismaClient } from "@soundz/database";
import { PRISMA } from "../prisma/prisma.module.js";

@Injectable()
export class SettingsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async listBranches(): Promise<object> {
    const items = await this.prisma.branch.findMany({ include: { schedules: { orderBy: { weekday: "asc" } }, services: { include: { service: true } } }, orderBy: { name: "asc" } });
    return { items };
  }
  async createBranch(input: BranchInput, actorUserId: string): Promise<object> { const created = await this.prisma.branch.create({ data: input }); await this.audit(actorUserId, "branch.created", "Branch", created.id, null, created); return created; }
  async updateBranch(id: string, input: Partial<BranchInput>, actorUserId: string): Promise<object> { const existing = await this.prisma.branch.findUnique({ where: { id } }); if (!existing) throw new NotFoundException("Filial topilmadi"); const updated = await this.prisma.branch.update({ where: { id }, data: input }); await this.audit(actorUserId, "branch.updated", "Branch", id, existing, updated); return updated; }
  async setSchedules(branchId: string, input: BranchSchedulesInput, actorUserId: string): Promise<object> { const branch = await this.prisma.branch.findUnique({ where: { id: branchId } }); if (!branch) throw new NotFoundException("Filial topilmadi"); await this.prisma.$transaction(async (tx) => { for (const item of input.items) await tx.branchSchedule.upsert({ where: { branchId_weekday: { branchId, weekday: item.weekday } }, update: item, create: { branchId, ...item } }); await tx.auditLog.create({ data: { actorUserId, action: "branch.schedules_updated", entityType: "Branch", entityId: branchId, after: input } }); }); return this.listBranches(); }
  async assignService(branchId: string, serviceId: string, input: { isActive: boolean }, actorUserId: string): Promise<object> { const [branch, service] = await Promise.all([this.prisma.branch.findUnique({ where: { id: branchId } }), this.prisma.service.findUnique({ where: { id: serviceId } })]); if (!branch || !service) throw new NotFoundException("Filial yoki xizmat topilmadi"); const result = await this.prisma.branchService.upsert({ where: { branchId_serviceId: { branchId, serviceId } }, update: { isActive: input.isActive, slotCapacity: 1 }, create: { branchId, serviceId, isActive: input.isActive, slotCapacity: 1 }, include: { service: true } }); await this.audit(actorUserId, "branch.service_assigned", "Branch", branchId, null, { serviceId, isActive: input.isActive }); return result; }
  async listServices(): Promise<object> { return { items: await this.prisma.service.findMany({ orderBy: { name: "asc" } }) }; }
  async createService(input: ServiceInput, actorUserId: string): Promise<object> { const created = await this.prisma.service.create({ data: input }); await this.audit(actorUserId, "service.created", "Service", created.id, null, created); return created; }
  async updateService(id: string, input: Partial<ServiceInput>, actorUserId: string): Promise<object> { const existing = await this.prisma.service.findUnique({ where: { id } }); if (!existing) throw new NotFoundException("Xizmat topilmadi"); const updated = await this.prisma.service.update({ where: { id }, data: input }); await this.audit(actorUserId, "service.updated", "Service", id, existing, updated); return updated; }

  listPublicBranches() {
    return this.prisma.$queryRawUnsafe(`SELECT b.id,b.slug,b.name,b.phone,b.address,
      (SELECT v.url FROM media_usages u JOIN media_variants v ON v.media_id=u.media_id AND v.variant_key='card' WHERE u.entity_type='branch' AND u.entity_id=b.id AND u.slot='cover' ORDER BY u.sort_order LIMIT 1) AS "imageUrl",
      COALESCE((SELECT json_agg(json_build_object('weekday',s.weekday,'openMinute',s.open_minute,'closeMinute',s.close_minute,'isClosed',s.is_closed) ORDER BY s.weekday) FROM "BranchSchedule" s WHERE s.branch_id=b.id),'[]') AS schedules
      FROM "Branch" b WHERE b.is_active=TRUE ORDER BY b.name`);
  }
  async getPublicBranch(slug: string) {
    const rows=await this.prisma.$queryRawUnsafe<any[]>(`SELECT b.id,b.slug,b.name,b.phone,b.address,
      (SELECT v.url FROM media_usages u JOIN media_variants v ON v.media_id=u.media_id AND v.variant_key='hero' WHERE u.entity_type='branch' AND u.entity_id=b.id AND u.slot='cover' ORDER BY u.sort_order LIMIT 1) AS "imageUrl",
      COALESCE((SELECT json_agg(json_build_object('weekday',s.weekday,'openMinute',s.open_minute,'closeMinute',s.close_minute,'isClosed',s.is_closed) ORDER BY s.weekday) FROM "BranchSchedule" s WHERE s.branch_id=b.id),'[]') AS schedules,
      COALESCE((SELECT json_agg(json_build_object('id',sv.id,'code',sv.code,'name',sv.name,'description',sv.description,'durationMinutes',sv.duration_minutes) ORDER BY sv.name) FROM "BranchService" bs JOIN "Service" sv ON sv.id=bs.service_id WHERE bs.branch_id=b.id AND bs.is_active=TRUE AND sv.is_active=TRUE),'[]') AS services
      FROM "Branch" b WHERE b.slug=$1 AND b.is_active=TRUE LIMIT 1`,slug); if(!rows[0])throw new NotFoundException("Filial topilmadi"); return rows[0];
  }
  listPublicServices(){return this.prisma.service.findMany({where:{isActive:true},orderBy:{name:"asc"},select:{id:true,code:true,name:true,description:true,durationMinutes:true}})}
  async getPublicService(code:string){const item=await this.prisma.service.findUnique({where:{code},include:{branchServices:{where:{isActive:true},include:{branch:true}}}});if(!item||!item.isActive)throw new NotFoundException("Xizmat topilmadi");return {...item,branches:item.branchServices.filter(x=>x.branch.isActive).map(x=>x.branch)} }

  private async audit(actorUserId: string, action: string, entityType: string, entityId: string, before: object | null, after: object): Promise<void> { const toJson = (value: object): object => JSON.parse(JSON.stringify(value)) as object; await this.prisma.auditLog.create({ data: { actorUserId, action, entityType, entityId, before: before === null ? undefined : (toJson(before) as never), after: toJson(after) as never } }); }
}
