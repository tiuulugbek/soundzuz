import { BadRequestException, Body, Controller, Get, Headers, Ip, Post, Query, Req } from "@nestjs/common";
import { publicAppointmentSchema } from "@soundz/contracts";
import type { Request } from "express";
import { RateLimitService } from "../common/rate-limit.service.js";
import { AppointmentsService } from "./appointments.service.js";

@Controller("public/booking")
export class PublicAppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly rateLimit: RateLimitService,
  ) {}

  @Get("branches")
  listBranches(): Promise<object> {
    return this.appointmentsService.listBranches();
  }

  @Get("services")
  listServices(@Query("branchId") branchId?: string): Promise<object> {
    if (!branchId) throw new BadRequestException("branchId talab qilinadi");
    return this.appointmentsService.listServices(branchId);
  }

  @Get("slots")
  listSlots(
    @Query("branchId") branchId?: string,
    @Query("serviceId") serviceId?: string,
    @Query("date") date?: string,
  ): Promise<object> {
    if (!branchId || !serviceId || !date) {
      throw new BadRequestException("branchId, serviceId va date talab qilinadi");
    }
    return this.appointmentsService.getAvailableSlots(branchId, serviceId, date);
  }

  @Post("appointments")
  async create(
    @Body() body: unknown,
    @Headers("x-idempotency-key") idempotencyKey: string | undefined,
    @Ip() ip: string,
    @Req() request: Request,
  ): Promise<object> {
    await this.rateLimit.consume(`appointment:${ip || "unknown"}`, 4, 60_000);
    const parsed = publicAppointmentSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: "Qabul ma’lumotlarini tekshiring",
        errors: parsed.error.flatten().fieldErrors,
      });
    }
    return this.appointmentsService.createPublicAppointment(parsed.data, {
      idempotencyKey,
      ipAddress: ip,
      userAgent: request.headers["user-agent"],
    });
  }
}
