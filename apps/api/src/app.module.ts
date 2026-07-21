import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { parseApiEnvironment } from "@soundz/config";
import { AuthModule } from "./auth/auth.module.js";
import { AppointmentsModule } from "./appointments/appointments.module.js";
import { ContentModule } from "./content/content.module.js";
import { HealthController } from "./health.controller.js";
import { LeadsModule } from "./leads/leads.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { SettingsModule } from "./settings/settings.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (input) => parseApiEnvironment(input),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        signOptions: { expiresIn: "8h" },
      }),
    }),
    PrismaModule,
    AuthModule,
    LeadsModule,
    AppointmentsModule,
    SettingsModule,
    ContentModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
