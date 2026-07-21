import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
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

  @Get("articles/:id")
  article(@Param("id") id: string) {
    return this.content.getAdminArticle(id);
  }

  @Post("articles")
  createArticle(@Body() body: unknown) {
    return this.content.createArticle(body);
  }

  @Patch("articles/:id")
  updateArticle(@Param("id") id: string, @Body() body: unknown) {
    return this.content.updateArticle(id, body);
  }

  @Get("faqs")
  faqs() {
    return this.content.listAdminFaqs();
  }

  @Get("faqs/:id")
  faq(@Param("id") id: string) {
    return this.content.getAdminFaq(id);
  }

  @Post("faqs")
  createFaq(@Body() body: unknown) {
    return this.content.createFaq(body);
  }

  @Patch("faqs/:id")
  updateFaq(@Param("id") id: string, @Body() body: unknown) {
    return this.content.updateFaq(id, body);
  }
}