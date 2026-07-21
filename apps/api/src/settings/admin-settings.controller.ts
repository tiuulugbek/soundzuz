import { Body, Controller, Get, Param, Patch, Post, Put, Req, UseGuards } from "@nestjs/common";
import { branchInputSchema, branchSchedulesInputSchema, branchServiceInputSchema, serviceInputSchema } from "@soundz/contracts";
import type { AuthenticatedRequest } from "../auth/jwt-auth.guard.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { SettingsService } from "./settings.service.js";

@Controller("admin/settings")
@UseGuards(JwtAuthGuard)
export class AdminSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get("branches") listBranches(): Promise<object> { return this.settings.listBranches(); }
  @Post("branches") createBranch(@Body() body: unknown, @Req() req: AuthenticatedRequest): Promise<object> { return this.settings.createBranch(branchInputSchema.parse(body), req.user.sub); }
  @Patch("branches/:id") updateBranch(@Param("id") id: string, @Body() body: unknown, @Req() req: AuthenticatedRequest): Promise<object> { return this.settings.updateBranch(id, branchInputSchema.partial().parse(body), req.user.sub); }
  @Put("branches/:id/schedules") setSchedules(@Param("id") id: string, @Body() body: unknown, @Req() req: AuthenticatedRequest): Promise<object> { return this.settings.setSchedules(id, branchSchedulesInputSchema.parse(body), req.user.sub); }
  @Put("branches/:branchId/services/:serviceId") assignService(@Param("branchId") branchId: string, @Param("serviceId") serviceId: string, @Body() body: unknown, @Req() req: AuthenticatedRequest): Promise<object> { return this.settings.assignService(branchId, serviceId, branchServiceInputSchema.parse(body), req.user.sub); }

  @Get("services") listServices(): Promise<object> { return this.settings.listServices(); }
  @Post("services") createService(@Body() body: unknown, @Req() req: AuthenticatedRequest): Promise<object> { return this.settings.createService(serviceInputSchema.parse(body), req.user.sub); }
  @Patch("services/:id") updateService(@Param("id") id: string, @Body() body: unknown, @Req() req: AuthenticatedRequest): Promise<object> { return this.settings.updateService(id, serviceInputSchema.partial().parse(body), req.user.sub); }
}
