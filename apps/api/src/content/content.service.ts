import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { PrismaClient } from "@soundz/database";
import { randomUUID } from "node:crypto";
import { PRISMA } from "../prisma/prisma.module.js";

type Locale = "uz" | "ru";
type ContentStatus = "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED" | "NEEDS_UPDATE" | "ARCHIVED";

@Injectable()
export class ContentService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  listCategories(locale: Locale = "uz") {
    return this.prisma.$queryRawUnsafe(
      `SELECT id, slug, name, description, sort_order AS "sortOrder"
       FROM article_categories WHERE locale = $1 AND is_active = TRUE
       ORDER BY sort_order, name`,
      locale,
    );
  }

  listArticles(input: { locale?: Locale; category?: string; search?: string; limit?: number }) {
    const locale = input.locale ?? "uz";
    const limit = Math.min(Math.max(input.limit ?? 24, 1), 100);
    const search = input.search?.trim() || null;
    const category = input.category?.trim() || null;
    return this.prisma.$queryRawUnsafe(
      `SELECT a.id, a.slug, a.locale, a.title, a.excerpt,
              a.featured_image_url AS "featuredImageUrl",
              a.reading_time_minutes AS "readingTimeMinutes",
              a.author_name AS "authorName", a.reviewer_name AS "reviewerName",
              a.published_at AS "publishedAt", c.name AS "categoryName", c.slug AS "categorySlug"
       FROM articles a
       LEFT JOIN article_categories c ON c.id = a.category_id
       WHERE a.locale = $1 AND a.status = 'PUBLISHED'
         AND ($2::text IS NULL OR c.slug = $2)
         AND ($3::text IS NULL OR to_tsvector('simple', coalesce(a.title,'') || ' ' || coalesce(a.excerpt,'') || ' ' || coalesce(a.content,'')) @@ plainto_tsquery('simple', $3))
       ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC
       LIMIT $4`,
      locale,
      category,
      search,
      limit,
    );
  }

  async getArticle(slug: string, locale: Locale = "uz") {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT a.*, c.name AS "categoryName", c.slug AS "categorySlug"
       FROM articles a LEFT JOIN article_categories c ON c.id = a.category_id
       WHERE a.slug = $1 AND a.locale = $2 AND a.status = 'PUBLISHED' LIMIT 1`,
      slug,
      locale,
    );
    if (!rows[0]) throw new NotFoundException("Maqola topilmadi");
    return rows[0];
  }

  listFaqs(input: { locale?: Locale; category?: string; search?: string }) {
    const locale = input.locale ?? "uz";
    const search = input.search?.trim() || null;
    const category = input.category?.trim() || null;
    return this.prisma.$queryRawUnsafe(
      `SELECT f.id, f.question, f.short_answer AS "shortAnswer", f.full_answer AS "fullAnswer",
              f.sort_order AS "sortOrder", c.name AS "categoryName", c.slug AS "categorySlug",
              a.slug AS "relatedArticleSlug"
       FROM faqs f
       LEFT JOIN faq_categories c ON c.id = f.category_id
       LEFT JOIN articles a ON a.id = f.related_article_id
       WHERE f.locale = $1 AND f.status = 'PUBLISHED'
         AND ($2::text IS NULL OR c.slug = $2)
         AND ($3::text IS NULL OR to_tsvector('simple', coalesce(f.question,'') || ' ' || coalesce(f.short_answer,'') || ' ' || coalesce(f.full_answer,'')) @@ plainto_tsquery('simple', $3))
       ORDER BY c.sort_order, f.sort_order, f.question`,
      locale,
      category,
      search,
    );
  }

  async searchKnowledge(query: string, locale: Locale = "uz") {
    const q = query.trim();
    if (!q) return { articles: [], faqs: [] };
    const [articles, faqs] = await Promise.all([
      this.listArticles({ locale, search: q, limit: 10 }),
      this.listFaqs({ locale, search: q }),
    ]);
    return { articles, faqs };
  }

  listAdminArticles() {
    return this.prisma.$queryRawUnsafe(
      `SELECT a.id, a.slug, a.locale, a.title, a.status, a.updated_at AS "updatedAt",
              c.name AS "categoryName" FROM articles a
       LEFT JOIN article_categories c ON c.id = a.category_id
       ORDER BY a.updated_at DESC`,
    );
  }

  createArticle(input: any) {
    const id = randomUUID();
    const status: ContentStatus = input.status ?? "DRAFT";
    return this.prisma.$queryRawUnsafe(
      `INSERT INTO articles
       (id, slug, locale, category_id, title, excerpt, content, status, author_name, reviewer_name,
        seo_title, seo_description, reading_time_minutes, medical_disclaimer, published_at, last_reviewed_at, next_review_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::"ContentStatus",$9,$10,$11,$12,$13,$14,
               CASE WHEN $8 = 'PUBLISHED' THEN NOW() ELSE NULL END,$15,$16)
       RETURNING *`,
      id, input.slug, input.locale ?? "uz", input.categoryId ?? null, input.title, input.excerpt,
      input.content, status, input.authorName ?? null, input.reviewerName ?? null,
      input.seoTitle ?? null, input.seoDescription ?? null, input.readingTimeMinutes ?? 5,
      input.medicalDisclaimer ?? "Ushbu ma’lumot umumiy tushuntirish uchun berilgan va individual tibbiy tashxis o‘rnini bosmaydi.",
      input.lastReviewedAt ? new Date(input.lastReviewedAt) : null,
      input.nextReviewAt ? new Date(input.nextReviewAt) : null,
    );
  }

  createFaq(input: any) {
    return this.prisma.$queryRawUnsafe(
      `INSERT INTO faqs
       (id, locale, category_id, question, short_answer, full_answer, status, sort_order, related_article_id, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7::"ContentStatus",$8,$9,CASE WHEN $7 = 'PUBLISHED' THEN NOW() ELSE NULL END)
       RETURNING *`,
      randomUUID(), input.locale ?? "uz", input.categoryId ?? null, input.question, input.shortAnswer,
      input.fullAnswer ?? null, input.status ?? "DRAFT", input.sortOrder ?? 0, input.relatedArticleId ?? null,
    );
  }
}
