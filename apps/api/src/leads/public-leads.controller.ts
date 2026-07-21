import { BadRequestException, Body, Controller, Headers, Ip, Post, Req } from "@nestjs/common";
import { publicLeadSchema } from "@soundz/contracts";
import type { Request } from "express";
import { RateLimitService } from "../common/rate-limit.service.js";
import { LeadsService } from "./leads.service.js";

@Controller("public/leads")
export class PublicLeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly rateLimit: RateLimitService,
  ) {}

  @Post()
  async create(
    @Body() body: unknown,
    @Headers("x-idempotency-key") idempotencyKey: string | undefined,
    @Ip() ip: string,
    @Req() request: Request,
  ): Promise<object> {
    await this.rateLimit.consume(ip || "unknown");
    const parsed = publicLeadSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: "Forma ma’lumotlarini tekshiring",
        errors: parsed.error.flatten().fieldErrors,
      });
    }
    return this.leadsService.createPublicLead(parsed.data, {
      idempotencyKey,
      ipAddress: ip,
      userAgent: request.headers["user-agent"],
    });
  }
}
