import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { ContentService } from "./content.service.js";

@Controller("admin/content")
@UseGuards(JwtAuthGuard)
export class AdminContentController {
  constructor(private readonly content: ContentService) {}

  @Get("articles")
  articles() {
    return this.content.listAdminArticles();
  }

  @Post("articles")
  createArticle(@Body() body: unknown) {
    return this.content.createArticle(body);
  }

  @Post("faqs")
  createFaq(@Body() body: unknown) {
    return this.content.createFaq(body);
  }
}
