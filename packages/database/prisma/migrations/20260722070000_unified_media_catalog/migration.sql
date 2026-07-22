-- Unified media and catalog schema. Safe for databases where early runtime-created tables already exist.

CREATE TABLE IF NOT EXISTS "media_assets" (
  "id" TEXT PRIMARY KEY,
  "original_name" TEXT NOT NULL,
  "mime_type" TEXT NOT NULL,
  "width" INTEGER NOT NULL,
  "height" INTEGER NOT NULL,
  "alt_text" TEXT,
  "caption" TEXT,
  "storage_provider" TEXT NOT NULL DEFAULT 'local',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "media_variants" (
  "id" TEXT PRIMARY KEY,
  "media_id" TEXT NOT NULL REFERENCES "media_assets"("id") ON DELETE CASCADE,
  "variant_key" TEXT NOT NULL,
  "width" INTEGER NOT NULL,
  "height" INTEGER NOT NULL,
  "size_bytes" INTEGER NOT NULL,
  "path" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "media_variants_media_id_variant_key_key" UNIQUE ("media_id", "variant_key")
);

CREATE TABLE IF NOT EXISTS "media_usages" (
  "id" TEXT PRIMARY KEY,
  "media_id" TEXT NOT NULL REFERENCES "media_assets"("id") ON DELETE CASCADE,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "slot" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "media_usages_entity_slot_order_key" UNIQUE ("entity_type", "entity_id", "slot", "sort_order")
);

CREATE INDEX IF NOT EXISTS "media_usages_entity_idx" ON "media_usages" ("entity_type", "entity_id", "slot");
CREATE INDEX IF NOT EXISTS "media_variants_media_idx" ON "media_variants" ("media_id");

CREATE TABLE IF NOT EXISTS "products" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "locale" TEXT NOT NULL DEFAULT 'uz',
  "name" TEXT NOT NULL,
  "short_description" TEXT,
  "description" TEXT,
  "brand" TEXT,
  "form_factor" TEXT,
  "technology_level" TEXT,
  "price_from" NUMERIC,
  "price_to" NUMERIC,
  "rechargeable" BOOLEAN NOT NULL DEFAULT FALSE,
  "bluetooth" BOOLEAN NOT NULL DEFAULT FALSE,
  "in_stock" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_featured" BOOLEAN NOT NULL DEFAULT FALSE,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "seo_title" TEXT,
  "seo_description" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "seo_title" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "seo_description" TEXT;
CREATE INDEX IF NOT EXISTS "products_status_locale_idx" ON "products" ("status", "locale");
CREATE INDEX IF NOT EXISTS "products_brand_form_idx" ON "products" ("brand", "form_factor");

CREATE TABLE IF NOT EXISTS "catalog_taxonomies" (
  "id" TEXT PRIMARY KEY,
  "type" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "catalog_taxonomies_type_value_key" UNIQUE ("type", "value")
);

CREATE INDEX IF NOT EXISTS "catalog_taxonomies_type_active_idx" ON "catalog_taxonomies" ("type", "is_active", "sort_order");
