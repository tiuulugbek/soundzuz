import { Controller, Get, Param, Query } from "@nestjs/common";
import { ContentService } from "./content.service.js";

@Controller("content")
export class PublicContentController {
  constructor(private readonly content: ContentService) {}

  @Get("categories")
  categories(@Query("locale") locale: "uz" | "ru" = "uz") {
    return this.content.listCategories(locale);
  }

  @Get("articles")
  articles(
    @Query("locale") locale: "uz" | "ru" = "uz",
    @Query("category") category?: string,
    @Query("q") search?: string,
    @Query("limit") limit?: string,
  ) {
    return this.content.listArticles({ locale, category, search, limit: Number(limit) || 24 });
  }

  @Get("articles/:slug")
  article(@Param("slug") slug: string, @Query("locale") locale: "uz" | "ru" = "uz") {
    return this.content.getArticle(slug, locale);
  }

  @Get("faqs")
  faqs(
    @Query("locale") locale: "uz" | "ru" = "uz",
    @Query("category") category?: string,
    @Query("q") search?: string,
  ) {
    return this.content.listFaqs({ locale, category, search });
  }

  @Get("search")
  search(@Query("q") query = "", @Query("locale") locale: "uz" | "ru" = "uz") {
    return this.content.searchKnowledge(query, locale);
  }
}
