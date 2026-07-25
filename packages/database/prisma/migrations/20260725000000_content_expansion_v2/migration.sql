-- Content Hub kengaytmasi (v2): teglar, bog'liq mahsulot/xizmat, ko'rishlar,
-- qidiruv so'rovlari, foydalanuvchi fikri (feedback) va maqola versiyalari.
-- Barcha operatsiyalar IDEMPOTENT va ADDITIVE — mavjud ma'lumotga tegmaydi.

-- ---- Teglar (per-locale) ----------------------------------------------------
CREATE TABLE IF NOT EXISTS "article_tags" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "locale" TEXT NOT NULL DEFAULT 'uz',
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "article_tags_slug_locale_key" ON "article_tags" ("slug", "locale");

CREATE TABLE IF NOT EXISTS "article_tag_relations" (
  "article_id" TEXT NOT NULL,
  "tag_id" TEXT NOT NULL,
  PRIMARY KEY ("article_id", "tag_id")
);
DO $$ BEGIN
  ALTER TABLE "article_tag_relations"
    ADD CONSTRAINT "atr_article_fk" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "article_tag_relations"
    ADD CONSTRAINT "atr_tag_fk" FOREIGN KEY ("tag_id") REFERENCES "article_tags"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "atr_tag_idx" ON "article_tag_relations" ("tag_id");

-- ---- Bog'liq mahsulotlar (slug bo'yicha — per-locale mustaqil) --------------
CREATE TABLE IF NOT EXISTS "content_related_products" (
  "article_id" TEXT NOT NULL,
  "product_slug" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY ("article_id", "product_slug")
);
DO $$ BEGIN
  ALTER TABLE "content_related_products"
    ADD CONSTRAINT "crp_article_fk" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- Bog'liq xizmatlar (code bo'yicha) -------------------------------------
CREATE TABLE IF NOT EXISTS "content_related_services" (
  "article_id" TEXT NOT NULL,
  "service_code" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY ("article_id", "service_code")
);
DO $$ BEGIN
  ALTER TABLE "content_related_services"
    ADD CONSTRAINT "crs_article_fk" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- Ko'rishlar (analitika) ------------------------------------------------
CREATE TABLE IF NOT EXISTS "content_views" (
  "id" TEXT PRIMARY KEY,
  "entity_type" TEXT NOT NULL,          -- 'article' | 'faq'
  "entity_id" TEXT NOT NULL,
  "locale" TEXT NOT NULL DEFAULT 'uz',
  "referrer" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "content_views_entity_idx" ON "content_views" ("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "content_views_created_idx" ON "content_views" ("created_at");

-- ---- Qidiruv so'rovlari (analitika + kontent strategiyasi) -----------------
CREATE TABLE IF NOT EXISTS "search_queries" (
  "id" TEXT PRIMARY KEY,
  "query" TEXT NOT NULL,
  "locale" TEXT NOT NULL DEFAULT 'uz',
  "results_count" INTEGER NOT NULL DEFAULT 0,
  "answered" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "search_queries_created_idx" ON "search_queries" ("created_at");
CREATE INDEX IF NOT EXISTS "search_queries_query_idx" ON "search_queries" (lower("query"));

-- ---- Foydalanuvchi fikri ("Foydali bo'ldimi?") -----------------------------
CREATE TABLE IF NOT EXISTS "content_feedback" (
  "id" TEXT PRIMARY KEY,
  "entity_type" TEXT NOT NULL,          -- 'article' | 'faq'
  "entity_id" TEXT NOT NULL,
  "locale" TEXT NOT NULL DEFAULT 'uz',
  "helpful" BOOLEAN NOT NULL,
  "comment" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "content_feedback_entity_idx" ON "content_feedback" ("entity_type", "entity_id");

-- ---- Maqola versiyalari (audit / tarix) ------------------------------------
CREATE TABLE IF NOT EXISTS "article_revisions" (
  "id" TEXT PRIMARY KEY,
  "article_id" TEXT NOT NULL,
  "snapshot" JSONB NOT NULL,
  "editor" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
DO $$ BEGIN
  ALTER TABLE "article_revisions"
    ADD CONSTRAINT "arev_article_fk" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "article_revisions_article_idx" ON "article_revisions" ("article_id", "created_at" DESC);
