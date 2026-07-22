import { Controller, Get, Param } from "@nestjs/common";
import { SettingsService } from "./settings.service.js";

@Controller("locations")
export class PublicSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get("branches")
  branches() {
    return this.settings.listPublicBranches();
  }

  @Get("branches/:slug")
  branch(@Param("slug") slug: string) {
    return this.settings.getPublicBranch(slug);
  }

  @Get("services")
  services() {
    return this.settings.listPublicServices();
  }

  @Get("services/:code")
  service(@Param("code") code: string) {
    return this.settings.getPublicService(code);
  }
}
