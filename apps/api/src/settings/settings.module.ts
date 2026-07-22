import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { AdminSettingsController } from "./admin-settings.controller.js";
import { PublicSettingsController } from "./public-settings.controller.js";
import { SettingsService } from "./settings.service.js";

@Module({ imports: [AuthModule], controllers: [AdminSettingsController, PublicSettingsController], providers: [SettingsService] })
export class SettingsModule {}
