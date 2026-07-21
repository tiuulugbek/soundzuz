import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { PrismaClient } from "@soundz/database";
import { randomUUID } from "node:crypto";
import { PRISMA } from "../prisma/prisma.module.js";

type Locale = "uz" | "ru";
type ContentStatus = "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED" | "NEEDS_UPDATE" | "ARCHIVED";

@Injectable()
export class ContentService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  private categoryTable(kind: string): "article_categories" | "faq_categories" {
    if (kind === "articles") return "article_categories";
    if (kind === "faqs") return "faq_categories";
    throw new BadRequestException("Noto‘g‘ri kategoriya turi");
  }

  listCategories(locale: Locale = "uz") {
    return this.prisma.$queryRawUnsafe(
      `SELECT id, slug, name, description, sort_order AS "sortOrder"
       FROM article_categories WHERE locale = $1 AND is_active = TRUE
       ORDER BY sort_order, name`, locale,
    );
  }

  listArticles(input: { locale?: Locale; category?: string; search?: string; limit?: number }) {
    const locale = input.locale ?? "uz";
    const limit = Math.min(Math.max(input.limit ?? 24, 1), 100);
    const search = input.search?.trim() || null;
    const category = input.category?.trim() || null;
    return this.prisma.$queryRawUnsafe(
      `SELECT a.id, a.slug, a.locale, a.title, a.excerpt,
              a.featured_image_url AS "featuredImageUrl", a.reading_time_minutes AS "readingTimeMinutes",
              a.author_name AS "authorName", a.reviewer_name AS "reviewerName",
              a.published_at AS "publishedAt", c.name AS "categoryName", c.slug AS "categorySlug"
       FROM articles a LEFT JOIN article_categories c ON c.id = a.category_id
       WHERE a.locale = $1 AND a.status = 'PUBLISHED'
         AND ($2::text IS NULL OR c.slug = $2)
         AND ($3::text IS NULL OR to_tsvector('simple', coalesce(a.title,'') || ' ' || coalesce(a.excerpt,'') || ' ' || coalesce(a.content,'')) @@ plainto_tsquery('simple', $3))
       ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC LIMIT $4`,
      locale, category, search, limit,
    );
  }

  async getArticle(slug: string, locale: Locale = "uz") {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT a.*, c.name AS "categoryName", c.slug AS "categorySlug"
       FROM articles a LEFT JOIN article_categories c ON c.id = a.category_id
       WHERE a.slug = $1 AND a.locale = $2 AND a.status = 'PUBLISHED' LIMIT 1`, slug, locale,
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
       FROM faqs f LEFT JOIN faq_categories c ON c.id = f.category_id
       LEFT JOIN articles a ON a.id = f.related_article_id
       WHERE f.locale = $1 AND f.status = 'PUBLISHED'
         AND ($2::text IS NULL OR c.slug = $2)
         AND ($3::text IS NULL OR to_tsvector('simple', coalesce(f.question,'') || ' ' || coalesce(f.short_answer,'') || ' ' || coalesce(f.full_answer,'')) @@ plainto_tsquery('simple', $3))
       ORDER BY c.sort_order, f.sort_order, f.question`, locale, category, search,
    );
  }

  async searchKnowledge(query: string, locale: Locale = "uz") {
    const q = query.trim();
    if (!q) return { articles: [], faqs: [] };
    const [articles, faqs] = await Promise.all([
      this.listArticles({ locale, search: q, limit: 10 }), this.listFaqs({ locale, search: q }),
    ]);
    return { articles, faqs };
  }

  listAdminArticles() {
    return this.prisma.$queryRawUnsafe(
      `SELECT a.id, a.slug, a.locale, a.title, a.status, a.updated_at AS "updatedAt",
              a.featured_image_url AS "featuredImageUrl", c.name AS "categoryName" FROM articles a
       LEFT JOIN article_categories c ON c.id = a.category_id ORDER BY a.updated_at DESC`,
    );
  }

  async getAdminArticle(id: string) {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id, slug, locale, category_id AS "categoryId", title, excerpt, content, status,
              featured_image_url AS "featuredImageUrl", author_name AS "authorName", reviewer_name AS "reviewerName", seo_title AS "seoTitle",
              seo_description AS "seoDescription", reading_time_minutes AS "readingTimeMinutes",
              medical_disclaimer AS "medicalDisclaimer", published_at AS "publishedAt",
              last_reviewed_at AS "lastReviewedAt", next_review_at AS "nextReviewAt"
       FROM articles WHERE id = $1 LIMIT 1`, id,
    );
    if (!rows[0]) throw new NotFoundException("Maqola topilmadi");
    return rows[0];
  }

  createArticle(input: any) {
    const id = randomUUID();
    const status: ContentStatus = input.status ?? "DRAFT";
    return this.prisma.$queryRawUnsafe(
      `INSERT INTO articles
       (id, slug, locale, category_id, title, excerpt, content, status, featured_image_url, author_name, reviewer_name,
        seo_title, seo_description, reading_time_minutes, medical_disclaimer, published_at, last_reviewed_at, next_review_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::"ContentStatus",$9,$10,$11,$12,$13,$14,$15,
               CASE WHEN $8 = 'PUBLISHED' THEN NOW() ELSE NULL END,$16,$17) RETURNING *`,
      id, input.slug, input.locale ?? "uz", input.categoryId ?? null, input.title, input.excerpt,
      input.content, status, input.featuredImageUrl ?? null, input.authorName ?? null, input.reviewerName ?? null,
      input.seoTitle ?? null, input.seoDescription ?? null, input.readingTimeMinutes ?? 5,
      input.medicalDisclaimer ?? "Ushbu ma’lumot umumiy tushuntirish uchun berilgan va individual tibbiy tashxis o‘rnini bosmaydi.",
      input.lastReviewedAt ? new Date(input.lastReviewedAt) : null,
      input.nextReviewAt ? new Date(input.nextReviewAt) : null,
    );
  }

  async updateArticle(id: string, input: any) {
    await this.getAdminArticle(id);
    const status: ContentStatus = input.status ?? "DRAFT";
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `UPDATE articles SET slug=$2, locale=$3, category_id=$4, title=$5, excerpt=$6, content=$7,
       status=$8::"ContentStatus", featured_image_url=$9, author_name=$10, reviewer_name=$11, seo_title=$12,
       seo_description=$13, reading_time_minutes=$14, medical_disclaimer=$15,
       published_at=CASE WHEN $8='PUBLISHED' THEN COALESCE(published_at,NOW()) ELSE published_at END,
       last_reviewed_at=$16, next_review_at=$17, updated_at=NOW() WHERE id=$1 RETURNING *`,
      id, input.slug, input.locale ?? "uz", input.categoryId ?? null, input.title, input.excerpt,
      input.content, status, input.featuredImageUrl ?? null, input.authorName ?? null, input.reviewerName ?? null,
      input.seoTitle ?? null, input.seoDescription ?? null, input.readingTimeMinutes ?? 5,
      input.medicalDisclaimer ?? null, input.lastReviewedAt ? new Date(input.lastReviewedAt) : null,
      input.nextReviewAt ? new Date(input.nextReviewAt) : null,
    );
    return rows[0];
  }

  listAdminFaqs() {
    return this.prisma.$queryRawUnsafe(
      `SELECT f.id, f.locale, f.question, f.status, f.sort_order AS "sortOrder",
              f.updated_at AS "updatedAt", c.name AS "categoryName"
       FROM faqs f LEFT JOIN faq_categories c ON c.id=f.category_id ORDER BY f.updated_at DESC`,
    );
  }

  async getAdminFaq(id: string) {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id, locale, category_id AS "categoryId", question, short_answer AS "shortAnswer",
              full_answer AS "fullAnswer", status, sort_order AS "sortOrder",
              related_article_id AS "relatedArticleId" FROM faqs WHERE id=$1 LIMIT 1`, id,
    );
    if (!rows[0]) throw new NotFoundException("FAQ topilmadi");
    return rows[0];
  }

  createFaq(input: any) {
    return this.prisma.$queryRawUnsafe(
      `INSERT INTO faqs
       (id, locale, category_id, question, short_answer, full_answer, status, sort_order, related_article_id, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7::"ContentStatus",$8,$9,CASE WHEN $7='PUBLISHED' THEN NOW() ELSE NULL END)
       RETURNING *`, randomUUID(), input.locale ?? "uz", input.categoryId ?? null, input.question,
      input.shortAnswer, input.fullAnswer ?? null, input.status ?? "DRAFT", input.sortOrder ?? 0,
      input.relatedArticleId ?? null,
    );
  }

  async updateFaq(id: string, input: any) {
    await this.getAdminFaq(id);
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `UPDATE faqs SET locale=$2, category_id=$3, question=$4, short_answer=$5, full_answer=$6,
       status=$7::"ContentStatus", sort_order=$8, related_article_id=$9,
       published_at=CASE WHEN $7='PUBLISHED' THEN COALESCE(published_at,NOW()) ELSE published_at END,
       updated_at=NOW() WHERE id=$1 RETURNING *`,
      id, input.locale ?? "uz", input.categoryId ?? null, input.question, input.shortAnswer,
      input.fullAnswer ?? null, input.status ?? "DRAFT", input.sortOrder ?? 0, input.relatedArticleId ?? null,
    );
    return rows[0];
  }

  listAdminCategories(kind: string) {
    const table = this.categoryTable(kind);
    return this.prisma.$queryRawUnsafe(
      `SELECT id, slug, locale, name, description, sort_order AS "sortOrder", is_active AS "isActive"
       FROM ${table} ORDER BY locale, sort_order, name`,
    );
  }

  createCategory(kind: string, input: any) {
    const table = this.categoryTable(kind);
    return this.prisma.$queryRawUnsafe(
      `INSERT INTO ${table} (id, slug, locale, name, description, sort_order, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      randomUUID(), input.slug, input.locale ?? "uz", input.name, input.description ?? null,
      input.sortOrder ?? 0, input.isActive ?? true,
    );
  }

  async updateCategory(kind: string, id: string, input: any) {
    const table = this.categoryTable(kind);
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `UPDATE ${table} SET slug=$2, locale=$3, name=$4, description=$5, sort_order=$6,
       is_active=$7, updated_at=NOW() WHERE id=$1 RETURNING *`,
      id, input.slug, input.locale ?? "uz", input.name, input.description ?? null,
      input.sortOrder ?? 0, input.isActive ?? true,
    );
    if (!rows[0]) throw new NotFoundException("Kategoriya topilmadi");
    return rows[0];
  }
}
