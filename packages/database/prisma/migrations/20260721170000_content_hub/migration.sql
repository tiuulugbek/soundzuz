CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'NEEDS_UPDATE', 'ARCHIVED');

CREATE TABLE "article_categories" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "locale" TEXT NOT NULL DEFAULT 'uz',
  "name" TEXT NOT NULL,
  "description" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "articles" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "locale" TEXT NOT NULL DEFAULT 'uz',
  "category_id" TEXT REFERENCES "article_categories"("id") ON DELETE SET NULL,
  "title" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "featured_image_url" TEXT,
  "author_name" TEXT,
  "reviewer_name" TEXT,
  "seo_title" TEXT,
  "seo_description" TEXT,
  "reading_time_minutes" INTEGER NOT NULL DEFAULT 5,
  "medical_disclaimer" TEXT,
  "published_at" TIMESTAMPTZ,
  "last_reviewed_at" TIMESTAMPTZ,
  "next_review_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("slug", "locale")
);

CREATE INDEX "articles_public_idx" ON "articles" ("locale", "status", "published_at" DESC);
CREATE INDEX "articles_category_idx" ON "articles" ("category_id", "status");
CREATE INDEX "articles_search_idx" ON "articles" USING GIN (to_tsvector('simple', coalesce("title", '') || ' ' || coalesce("excerpt", '') || ' ' || coalesce("content", '')));

CREATE TABLE "faq_categories" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "locale" TEXT NOT NULL DEFAULT 'uz',
  "name" TEXT NOT NULL,
  "description" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "faqs" (
  "id" TEXT PRIMARY KEY,
  "locale" TEXT NOT NULL DEFAULT 'uz',
  "category_id" TEXT REFERENCES "faq_categories"("id") ON DELETE SET NULL,
  "question" TEXT NOT NULL,
  "short_answer" TEXT NOT NULL,
  "full_answer" TEXT,
  "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "related_article_id" TEXT REFERENCES "articles"("id") ON DELETE SET NULL,
  "published_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "faqs_public_idx" ON "faqs" ("locale", "status", "sort_order");
CREATE INDEX "faqs_search_idx" ON "faqs" USING GIN (to_tsvector('simple', coalesce("question", '') || ' ' || coalesce("short_answer", '') || ' ' || coalesce("full_answer", '')));

INSERT INTO "article_categories" ("id", "slug", "name", "description", "sort_order") VALUES
('cat_hearing_health', 'eshitish-salomatligi', 'Eshitish salomatligi', 'Eshitish, profilaktika va kundalik salomatlik bo‘yicha foydali ma’lumotlar.', 1),
('cat_audiometry', 'audiometriya', 'Audiometriya', 'Eshitishni tekshirish va audiogramma natijalarini tushunish.', 2),
('cat_hearing_loss', 'eshitish-pasayishi', 'Eshitish pasayishi', 'Belgilar, darajalar va qachon mutaxassisga murojaat qilish kerakligi.', 3),
('cat_hearing_aids', 'eshitish-moslamalari', 'Eshitish moslamalari', 'Moslama turlari, tanlash, sozlash va parvarishlash.', 4),
('cat_protection', 'eshitishni-asrash', 'Eshitishni asrash', 'Shovqin va baland ovozdan eshitishni himoya qilish.', 5),
('cat_tinnitus', 'tinnitus', 'Tinnitus', 'Quloqdagi shovqin va unga bog‘liq foydali tushuntirishlar.', 6)
ON CONFLICT DO NOTHING;

INSERT INTO "faq_categories" ("id", "slug", "name", "sort_order") VALUES
('faq_audiometry', 'audiometriya', 'Audiometriya haqida', 1),
('faq_devices', 'eshitish-moslamalari', 'Eshitish moslamalari haqida', 2),
('faq_prices', 'narxlar', 'Narxlar haqida', 3),
('faq_service', 'qabul-va-servis', 'Qabul va servis', 4)
ON CONFLICT DO NOTHING;
