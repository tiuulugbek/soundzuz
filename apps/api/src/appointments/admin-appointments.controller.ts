import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from "@nestjs/common";
import { appointmentStatusSchema, updateAppointmentStatusSchema } from "@soundz/contracts";
import type { AuthenticatedRequest } from "../auth/jwt-auth.guard.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { AppointmentsService } from "./appointments.service.js";

@Controller("admin/appointments")
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles("CALL_CENTER","BRANCH_MANAGER")
export class AdminAppointmentsController {
  constructor(private readonly appointmentsService:AppointmentsService){}
  @Get() list(@Query("page")page="1",@Query("limit")limit="50",@Query("status")status?:string,@Query("dateFrom")dateFrom?:string,@Query("dateTo")dateTo?:string):Promise<object>{const parsedStatus=status?appointmentStatusSchema.safeParse(status):undefined;return this.appointmentsService.listAdmin({page:Math.max(1,Number(page)||1),limit:Math.min(100,Math.max(1,Number(limit)||50)),status:parsedStatus?.success?parsedStatus.data:undefined,dateFrom,dateTo})}
  @Get(":id") detail(@Param("id")id:string):Promise<object>{return this.appointmentsService.getById(id)}
  @Patch(":id/status") updateStatus(@Param("id")id:string,@Body()body:unknown,@Req()request:AuthenticatedRequest):Promise<object>{const input=updateAppointmentStatusSchema.parse(body);return this.appointmentsService.updateStatus(id,input,request.user.sub,{ipAddress:request.ip,userAgent:request.headers["user-agent"]})}
}
