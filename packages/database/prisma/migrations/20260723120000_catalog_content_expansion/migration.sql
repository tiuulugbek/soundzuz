-- Bosqich 1: katalog + kontent kengaytmasi
-- Brands, product specs/relations, reviews, faqs, comparisons, articles (+clusters, links).
-- Idempotent: qayta ishga tushirish xavfsiz (IF NOT EXISTS / IF EXISTS).

-- Product: global unique slug -> composite unique (slug, locale); yangi ustunlar.
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_slug_key";
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "brand_slug" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "audience" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "products_slug_locale_key" ON "products" ("slug", "locale");
CREATE INDEX IF NOT EXISTS "products_brand_slug_idx" ON "products" ("brand_slug", "locale");

-- brands
CREATE TABLE IF NOT EXISTS "brands" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "locale" TEXT NOT NULL DEFAULT 'uz',
  "name" TEXT NOT NULL,
  "tagline" TEXT,
  "description" TEXT,
  "origin_country" TEXT,
  "website_url" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "seo_title" TEXT,
  "seo_description" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "brands_slug_locale_key" ON "brands" ("slug", "locale");
CREATE INDEX IF NOT EXISTS "brands_status_locale_idx" ON "brands" ("status", "locale", "sort_order");

-- product_specs
CREATE TABLE IF NOT EXISTS "product_specs" (
  "id" TEXT PRIMARY KEY,
  "product_id" TEXT NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "spec_group" TEXT,
  "label" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "unit" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "product_specs_product_idx" ON "product_specs" ("product_id", "sort_order");

-- product_relations (related products / accessories)
CREATE TABLE IF NOT EXISTS "product_relations" (
  "id" TEXT PRIMARY KEY,
  "product_id" TEXT NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "related_product_id" TEXT NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "kind" TEXT NOT NULL DEFAULT 'related',
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "product_relations_unique" UNIQUE ("product_id", "related_product_id", "kind")
);
CREATE INDEX IF NOT EXISTS "product_relations_product_idx" ON "product_relations" ("product_id", "kind");

-- reviews
CREATE TABLE IF NOT EXISTS "reviews" (
  "id" TEXT PRIMARY KEY,
  "product_id" TEXT REFERENCES "products"("id") ON DELETE CASCADE,
  "brand_slug" TEXT,
  "locale" TEXT NOT NULL DEFAULT 'uz',
  "author_name" TEXT NOT NULL,
  "rating" INTEGER NOT NULL DEFAULT 5,
  "title" TEXT,
  "body" TEXT,
  "is_published" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "reviews_product_idx" ON "reviews" ("product_id", "is_published");
CREATE INDEX IF NOT EXISTS "reviews_brand_idx" ON "reviews" ("brand_slug", "locale", "is_published");

-- Eslatma: faqs / articles / article_categories / faq_categories jadvallari
-- 20260721170000_content_hub migratsiyasida allaqachon mavjud — ular kontent
-- bosqichida Prisma'ga ulanadi. Bosqich 1 sof katalogga qaratilgan.

-- comparisons (programmatik taqqoslash sahifalari)
CREATE TABLE IF NOT EXISTS "comparisons" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "locale" TEXT NOT NULL DEFAULT 'uz',
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "entity_type" TEXT NOT NULL DEFAULT 'product',
  "entity_a_id" TEXT NOT NULL,
  "entity_b_id" TEXT NOT NULL,
  "summary" TEXT,
  "body" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "seo_title" TEXT,
  "seo_description" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "comparisons_slug_locale_key" ON "comparisons" ("slug", "locale");
CREATE INDEX IF NOT EXISTS "comparisons_status_locale_idx" ON "comparisons" ("status", "locale");
