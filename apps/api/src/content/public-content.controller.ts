import { Body, Controller, Get, Ip, Param, Post, Query } from "@nestjs/common";
import { RateLimitService } from "../common/rate-limit.service.js";
import { ContentService } from "./content.service.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Analitika yozuvlari faqat haqiqiy ID uchun — ixtiyoriy matn qabul qilinmaydi. */
function isUuid(value: unknown): boolean {
  return typeof value === "string" && UUID_RE.test(value);
}

@Controller("content")
export class PublicContentController {
  constructor(
    private readonly content: ContentService,
    private readonly rateLimit: RateLimitService,
  ) {}

  @Get("categories")
  categories(@Query("locale") locale: "uz" | "ru" = "uz") {
    return this.content.listCategories(locale);
  }

  @Get("tags")
  tags(@Query("locale") locale: "uz" | "ru" = "uz") {
    return this.content.listTags(locale);
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

  /**
   * Ko'rish hisoblagichi. Analitik signal — hech qanday shaxsiy ma'lumot
   * saqlanmaydi. IP bo'yicha rate limit spam yozuvlarni to'sadi.
   */
  @Post("view")
  async view(
    @Body() body: { entityType?: string; entityId?: string; locale?: "uz" | "ru"; referrer?: string },
    @Ip() ip: string,
  ) {
    if (!isUuid(body?.entityId)) return { ok: false };
    await this.rateLimit.consume(`content-view:${ip || "unknown"}`, 60, 60_000);
    return this.content
      .recordView(body.entityType ?? "article", body.entityId as string, body.locale ?? "uz", body.referrer)
      .then(() => ({ ok: true }))
      .catch(() => ({ ok: false }));
  }

  /** "Foydali bo'ldimi?" ovozi. Bir IP daqiqasiga 10 marta. */
  @Post("feedback")
  async feedback(
    @Body() body: { entityType?: string; entityId?: string; locale?: "uz" | "ru"; helpful?: boolean; comment?: string },
    @Ip() ip: string,
  ) {
    if (!isUuid(body?.entityId) || typeof body.helpful !== "boolean") return { ok: false };
    await this.rateLimit.consume(`content-feedback:${ip || "unknown"}`, 10, 60_000);
    return this.content.recordFeedback({
      entityType: body.entityType ?? "article",
      entityId: body.entityId as string,
      locale: body.locale ?? "uz",
      helpful: body.helpful,
      comment: body.comment,
    });
  }
}
