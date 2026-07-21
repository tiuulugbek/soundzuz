import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { RateLimitService } from "../common/rate-limit.service.js";
import { AdminAppointmentsController } from "./admin-appointments.controller.js";
import { AppointmentsService } from "./appointments.service.js";
import { PublicAppointmentsController } from "./public-appointments.controller.js";

@Module({
  imports: [AuthModule],
  controllers: [PublicAppointmentsController, AdminAppointmentsController],
  providers: [AppointmentsService, RateLimitService],
})
export class AppointmentsModule {}
