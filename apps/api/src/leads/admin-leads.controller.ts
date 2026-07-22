import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { createLeadNoteSchema, leadStatusSchema, updateLeadStatusSchema } from "@soundz/contracts";
import type { AuthenticatedRequest } from "../auth/jwt-auth.guard.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { LeadsService } from "./leads.service.js";

@Controller("admin/leads")
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles("CALL_CENTER","BRANCH_MANAGER")
export class AdminLeadsController {
  constructor(private readonly leadsService:LeadsService){}
  @Get() list(@Query("page")page="1",@Query("limit")limit="20",@Query("status")status?:string,@Query("search")search?:string):Promise<object>{const parsedStatus=status?leadStatusSchema.safeParse(status):undefined;return this.leadsService.list({page:Math.max(1,Number(page)||1),limit:Math.min(100,Math.max(1,Number(limit)||20)),status:parsedStatus?.success?parsedStatus.data:undefined,search})}
  @Get(":id") detail(@Param("id")id:string):Promise<object>{return this.leadsService.getById(id)}
  @Patch(":id/status") updateStatus(@Param("id")id:string,@Body()body:unknown,@Req()req:AuthenticatedRequest):Promise<object>{const input=updateLeadStatusSchema.parse(body);return this.leadsService.updateStatus(id,input,req.user.sub,{ipAddress:req.ip,userAgent:req.headers["user-agent"]})}
  @Post(":id/notes") addNote(@Param("id")id:string,@Body()body:unknown,@Req()req:AuthenticatedRequest):Promise<object>{const input=createLeadNoteSchema.parse(body);return this.leadsService.addNote(id,input.body,req.user.sub)}
}
