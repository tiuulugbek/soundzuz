import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { AdminContentController } from "./admin-content.controller.js";
import { ContentService } from "./content.service.js";
import { PublicContentController } from "./public-content.controller.js";

@Module({
  imports: [AuthModule],
  controllers: [PublicContentController, AdminContentController],
  providers: [ContentService],
})
export class ContentModule {}
