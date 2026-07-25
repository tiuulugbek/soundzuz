-- Maqolaga video havolasi (YouTube/Vimeo yoki to'g'ridan-to'g'ri fayl).
-- Idempotent va additive — mavjud ma'lumotga tegmaydi.

ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "video_url" TEXT;
