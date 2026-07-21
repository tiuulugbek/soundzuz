import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { RateLimitService } from "../common/rate-limit.service.js";
import { AdminLeadsController } from "./admin-leads.controller.js";
import { LeadsService } from "./leads.service.js";
import { PublicLeadsController } from "./public-leads.controller.js";

@Module({
  imports: [AuthModule],
  controllers: [PublicLeadsController, AdminLeadsController],
  providers: [LeadsService, RateLimitService],
})
export class LeadsModule {}
