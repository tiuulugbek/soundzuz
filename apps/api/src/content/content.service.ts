import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { PrismaClient } from "@soundz/database";
import { randomUUID } from "node:crypto";
import sanitizeHtml from "sanitize-html";
import { PRISMA } from "../prisma/prisma.module.js";

type Locale = "uz" | "ru";
type ContentStatus = "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED" | "NEEDS_UPDATE" | "ARCHIVED";

const sanitizeArticleContent = (value: unknown) => sanitizeHtml(String(value ?? ""), {
  allowedTags: ["p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li", "blockquote", "a", "img", "hr", "code", "pre"],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    h2: ["id"],
    h3: ["id"],
    h4: ["id"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  transformTags: {
    a: (_tagName, attribs) => ({ tagName: "a", attribs: { ...attribs, rel: "noopener noreferrer" } }),
    img: (_tagName, attribs) => ({ tagName: "img", attribs: { ...attribs, loading: "lazy" } }),
  },
});

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
       FROM article_categories WHERE locale = $1 AND is_active = TRUE ORDER BY sort_order, name`, locale,
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
      `SELECT a.*, a.video_url AS "videoUrl", c.name AS "categoryName", c.slug AS "categorySlug",
        COALESCE((SELECT json_agg(json_build_object(
          'id',f.id,'question',f.question,'shortAnswer',f.short_answer,'fullAnswer',f.full_answer,'sortOrder',f.sort_order
        ) ORDER BY f.sort_order,f.question)
        FROM faqs f WHERE f.related_article_id=a.id AND f.status='PUBLISHED'),'[]') AS faqs,
        COALESCE((SELECT json_agg(json_build_object('slug',t.slug,'name',t.name) ORDER BY t.name)
          FROM article_tag_relations tr JOIN article_tags t ON t.id=tr.tag_id WHERE tr.article_id=a.id),'[]') AS tags,
        COALESCE((SELECT json_agg(json_build_object(
            'slug',p.slug,'name',p.name,'brand',p.brand,'brandSlug',p.brand_slug,
            'priceFrom',p.price_from,'inStock',p.in_stock,'shortDescription',p.short_description
          ) ORDER BY crp.sort_order)
          FROM content_related_products crp
          JOIN products p ON p.slug=crp.product_slug AND p.locale=a.locale AND p.status='PUBLISHED'
          WHERE crp.article_id=a.id),'[]') AS "relatedProducts",
        COALESCE((SELECT json_agg(json_build_object('code',crs.service_code) ORDER BY crs.sort_order)
          FROM content_related_services crs WHERE crs.article_id=a.id),'[]') AS "relatedServices"
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

  /**
   * Bilim bazasidan qidiruv + "AI" javob. Javob FAQAT saytdagi tasdiqlangan
   * kontentdan (FAQ/maqola) ekstraktiv tarzda quriladi — tashxis qo'ymaydi,
   * hech narsa "o'ylab topilmaydi". So'rov analitikaga yoziladi.
   */
  async searchKnowledge(query: string, locale: Locale = "uz") {
    const q = query.trim();
    if (!q) return { articles: [], faqs: [], answer: null };
    const [articles, faqs] = await Promise.all([
      this.listArticles({ locale, search: q, limit: 10 }),
      this.listFaqs({ locale, search: q }),
    ]);

    const answer = this.buildAnswer(locale, faqs as any[], articles as any[]);
    // Analitika: nima qidirilgani va javob berilgan-berilmagani.
    this.prisma
      .$executeRawUnsafe(
        `INSERT INTO search_queries (id, query, locale, results_count, answered) VALUES ($1,$2,$3,$4,$5)`,
        randomUUID(), q.slice(0, 300), locale, (articles as any[]).length + (faqs as any[]).length, Boolean(answer),
      )
      .catch(() => undefined);

    return { articles, faqs, answer };
  }

  private buildAnswer(locale: Locale, faqs: any[], articles: any[]) {
    const disclaimer =
      locale === "ru"
        ? "Это общая информация из наших материалов, а не диагноз. Точную оценку даёт только специалист."
        : "Bu bizning materiallarimizdagi umumiy ma'lumot, tashxis emas. Aniq baholashni faqat mutaxassis beradi.";
    const top = faqs[0];
    if (top) {
      const text = (top.fullAnswer && String(top.fullAnswer).trim()) || top.shortAnswer || "";
      if (text) {
        return {
          text: String(text),
          source: { type: "faq" as const, question: top.question, articleSlug: top.relatedArticleSlug ?? null },
          disclaimer,
        };
      }
    }
    const article = articles[0];
    if (article?.excerpt) {
      return {
        text: String(article.excerpt),
        source: { type: "article" as const, title: article.title, slug: article.slug },
        disclaimer,
      };
    }
    return null;
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
      `SELECT a.id, a.slug, a.locale, a.category_id AS "categoryId", a.title, a.excerpt, a.content, a.status,
              a.featured_image_url AS "featuredImageUrl", a.author_name AS "authorName", a.reviewer_name AS "reviewerName", a.seo_title AS "seoTitle",
              a.seo_description AS "seoDescription", a.reading_time_minutes AS "readingTimeMinutes",
              a.medical_disclaimer AS "medicalDisclaimer", a.published_at AS "publishedAt",
              a.last_reviewed_at AS "lastReviewedAt", a.next_review_at AS "nextReviewAt",
              a.video_url AS "videoUrl",
              COALESCE((SELECT json_agg(t.name ORDER BY t.name)
                FROM article_tag_relations tr JOIN article_tags t ON t.id=tr.tag_id WHERE tr.article_id=a.id),'[]') AS tags,
              COALESCE((SELECT json_agg(crp.product_slug ORDER BY crp.sort_order)
                FROM content_related_products crp WHERE crp.article_id=a.id),'[]') AS "relatedProducts",
              COALESCE((SELECT json_agg(crs.service_code ORDER BY crs.sort_order)
                FROM content_related_services crs WHERE crs.article_id=a.id),'[]') AS "relatedServices"
       FROM articles a WHERE a.id = $1 LIMIT 1`, id,
    );
    if (!rows[0]) throw new NotFoundException("Maqola topilmadi");
    return rows[0];
  }

  async createArticle(input: any) {
    const id = randomUUID();
    const status: ContentStatus = input.status ?? "DRAFT";
    const locale: Locale = input.locale ?? "uz";
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `INSERT INTO articles
       (id, slug, locale, category_id, title, excerpt, content, status, featured_image_url, author_name, reviewer_name,
        seo_title, seo_description, reading_time_minutes, medical_disclaimer, published_at, last_reviewed_at, next_review_at,
        video_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::"ContentStatus",$9,$10,$11,$12,$13,$14,$15,
               CASE WHEN $8 = 'PUBLISHED' THEN NOW() ELSE NULL END,$16,$17,$18) RETURNING *`,
      id, input.slug, locale, input.categoryId ?? null, input.title, input.excerpt,
      sanitizeArticleContent(input.content), status, input.featuredImageUrl ?? null, input.authorName ?? null, input.reviewerName ?? null,
      input.seoTitle ?? null, input.seoDescription ?? null, input.readingTimeMinutes ?? 5,
      input.medicalDisclaimer ?? "Ushbu ma’lumot umumiy tushuntirish uchun berilgan va individual tibbiy tashxis o‘rnini bosmaydi.",
      input.lastReviewedAt ? new Date(input.lastReviewedAt) : null,
      input.nextReviewAt ? new Date(input.nextReviewAt) : null,
      input.videoUrl ?? null,
    );
    await this.setArticleTags(id, locale, input.tags);
    await this.setArticleRelated(id, input.relatedProducts, input.relatedServices);
    return rows[0];
  }

  async updateArticle(id: string, input: any) {
    const previous = await this.getAdminArticle(id);
    const status: ContentStatus = input.status ?? "DRAFT";
    const locale: Locale = input.locale ?? "uz";
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `UPDATE articles SET slug=$2, locale=$3, category_id=$4, title=$5, excerpt=$6, content=$7,
       status=$8::"ContentStatus", featured_image_url=$9, author_name=$10, reviewer_name=$11, seo_title=$12,
       seo_description=$13, reading_time_minutes=$14, medical_disclaimer=$15,
       published_at=CASE WHEN $8='PUBLISHED' THEN COALESCE(published_at,NOW()) ELSE published_at END,
       last_reviewed_at=$16, next_review_at=$17, video_url=$18, updated_at=NOW() WHERE id=$1 RETURNING *`,
      id, input.slug, locale, input.categoryId ?? null, input.title, input.excerpt,
      sanitizeArticleContent(input.content), status, input.featuredImageUrl ?? null, input.authorName ?? null, input.reviewerName ?? null,
      input.seoTitle ?? null, input.seoDescription ?? null, input.readingTimeMinutes ?? 5,
      input.medicalDisclaimer ?? null, input.lastReviewedAt ? new Date(input.lastReviewedAt) : null,
      input.nextReviewAt ? new Date(input.nextReviewAt) : null,
      input.videoUrl ?? null,
    );
    if (input.tags !== undefined) await this.setArticleTags(id, locale, input.tags);
    if (input.relatedProducts !== undefined || input.relatedServices !== undefined) {
      await this.setArticleRelated(id, input.relatedProducts, input.relatedServices);
    }
    // Oldingi holatni versiya sifatida saqlaymiz (audit / tiklash uchun).
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO article_revisions (id, article_id, snapshot, editor) VALUES ($1,$2,$3::jsonb,$4)`,
      randomUUID(), id, JSON.stringify(previous), input.editor ?? null,
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

  // ---- Teglar va bog'liq kontent (Content Hub v2) --------------------------

  private slugify(value: string): string {
    return String(value ?? "")
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "tag";
  }

  /** Maqola teglarini o'rnatadi (mavjudlarni almashtiradi). names: teg nomlari. */
  private async setArticleTags(articleId: string, locale: Locale, names: unknown) {
    const list = Array.isArray(names) ? names.map((n) => String(n).trim()).filter(Boolean) : [];
    await this.prisma.$executeRawUnsafe(`DELETE FROM article_tag_relations WHERE article_id = $1`, articleId);
    for (const name of list.slice(0, 20)) {
      const slug = this.slugify(name);
      const rows = await this.prisma.$queryRawUnsafe<any[]>(
        `INSERT INTO article_tags (id, slug, locale, name) VALUES ($1,$2,$3,$4)
         ON CONFLICT (slug, locale) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
         RETURNING id`,
        randomUUID(), slug, locale, name,
      );
      const tagId = rows[0]?.id;
      if (tagId) {
        await this.prisma.$executeRawUnsafe(
          `INSERT INTO article_tag_relations (article_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          articleId, tagId,
        );
      }
    }
  }

  /** Bog'liq mahsulot (slug) va xizmatlarni (code) o'rnatadi. */
  private async setArticleRelated(articleId: string, productSlugs: unknown, serviceCodes: unknown) {
    const products = Array.isArray(productSlugs) ? productSlugs.map((s) => String(s).trim()).filter(Boolean) : [];
    const services = Array.isArray(serviceCodes) ? serviceCodes.map((s) => String(s).trim()).filter(Boolean) : [];
    await this.prisma.$executeRawUnsafe(`DELETE FROM content_related_products WHERE article_id = $1`, articleId);
    await this.prisma.$executeRawUnsafe(`DELETE FROM content_related_services WHERE article_id = $1`, articleId);
    for (let i = 0; i < products.slice(0, 12).length; i++) {
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO content_related_products (article_id, product_slug, sort_order) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        articleId, products[i], i,
      );
    }
    for (let i = 0; i < services.slice(0, 12).length; i++) {
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO content_related_services (article_id, service_code, sort_order) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        articleId, services[i], i,
      );
    }
  }

  listTags(locale: Locale = "uz") {
    return this.prisma.$queryRawUnsafe(
      `SELECT t.slug, t.name, COUNT(r.article_id)::int AS "count"
       FROM article_tags t LEFT JOIN article_tag_relations r ON r.tag_id = t.id
       WHERE t.locale = $1 GROUP BY t.slug, t.name HAVING COUNT(r.article_id) > 0 ORDER BY t.name`, locale,
    );
  }

  /** Maqolani "ko'rildi" deb yozadi (analitika). */
  recordView(entityType: string, entityId: string, locale: Locale = "uz", referrer?: string) {
    const type = entityType === "faq" ? "faq" : "article";
    return this.prisma.$executeRawUnsafe(
      `INSERT INTO content_views (id, entity_type, entity_id, locale, referrer) VALUES ($1,$2,$3,$4,$5)`,
      randomUUID(), type, entityId, locale, referrer ?? null,
    );
  }

  /** "Foydali bo'ldimi?" javobini yozadi. */
  async recordFeedback(input: { entityType: string; entityId: string; locale?: Locale; helpful: boolean; comment?: string }) {
    const type = input.entityType === "faq" ? "faq" : "article";
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO content_feedback (id, entity_type, entity_id, locale, helpful, comment) VALUES ($1,$2,$3,$4,$5,$6)`,
      randomUUID(), type, input.entityId, input.locale ?? "uz", Boolean(input.helpful),
      input.comment ? String(input.comment).slice(0, 1000) : null,
    );
    return { ok: true };
  }

  async listRevisions(articleId: string) {
    return this.prisma.$queryRawUnsafe(
      `SELECT id, editor, created_at AS "createdAt" FROM article_revisions
       WHERE article_id = $1 ORDER BY created_at DESC LIMIT 50`, articleId,
    );
  }

  /** Admin analitikasi: eng ko'p qidirilgan, eng ko'p ko'rilgan, fikr yig'indisi. */
  async insights() {
    const [topSearches, topViewed, feedback] = await Promise.all([
      this.prisma.$queryRawUnsafe(
        `SELECT lower(query) AS "query", COUNT(*)::int AS "count",
                SUM(CASE WHEN answered THEN 0 ELSE 1 END)::int AS "unanswered"
         FROM search_queries WHERE created_at > NOW() - INTERVAL '90 days'
         GROUP BY lower(query) ORDER BY COUNT(*) DESC LIMIT 20`,
      ),
      this.prisma.$queryRawUnsafe(
        `SELECT v.entity_id AS "id", a.title, a.slug, v.locale, COUNT(*)::int AS "views"
         FROM content_views v JOIN articles a ON a.id = v.entity_id AND v.entity_type='article'
         WHERE v.created_at > NOW() - INTERVAL '90 days'
         GROUP BY v.entity_id, a.title, a.slug, v.locale ORDER BY COUNT(*) DESC LIMIT 20`,
      ),
      this.prisma.$queryRawUnsafe(
        `SELECT SUM(CASE WHEN helpful THEN 1 ELSE 0 END)::int AS "helpful",
                SUM(CASE WHEN helpful THEN 0 ELSE 1 END)::int AS "notHelpful", COUNT(*)::int AS "total"
         FROM content_feedback WHERE created_at > NOW() - INTERVAL '90 days'`,
      ),
    ]);
    return { topSearches, topViewed, feedback: (feedback as any[])[0] ?? { helpful: 0, notHelpful: 0, total: 0 } };
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
