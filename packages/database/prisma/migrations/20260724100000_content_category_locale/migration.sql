-- Bilim markazi kategoriyalarini 3 tilli qilish uchun:
-- article_categories / faq_categories slug'ini global unique'dan (slug, locale) unique'ga o'tkazamiz.
-- Idempotent va orqaga mos (mavjud global-unique qatorlar (slug,locale) bo'yicha ham unikal).

ALTER TABLE "article_categories" DROP CONSTRAINT IF EXISTS "article_categories_slug_key";
CREATE UNIQUE INDEX IF NOT EXISTS "article_categories_slug_locale_key" ON "article_categories" ("slug", "locale");

ALTER TABLE "faq_categories" DROP CONSTRAINT IF EXISTS "faq_categories_slug_key";
CREATE UNIQUE INDEX IF NOT EXISTS "faq_categories_slug_locale_key" ON "faq_categories" ("slug", "locale");
