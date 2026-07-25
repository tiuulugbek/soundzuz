-- Content Hub'ning birinchi migratsiyasi (20260721170000) o'zbekcha slug bilan
-- kategoriya yaratgan (`eshitish-salomatligi`, `audiometriya`, ...), keyinchalik
-- `content-sample.ts` seed'i esa inglizcha slug ishlatgan (`hearing-health`,
-- `audiometry`, ...). Natijada `/learn` sahifasida bir xil nomli, bo'sh
-- kategoriyalar dublikat bo'lib ko'rinadi.
--
-- Eski qatorlarni O'CHIRMAYMIZ (agar kimdir ularga maqola bog'lagan bo'lsa
-- yo'qotmaslik uchun) — faqat maqolasi yo'qlarini nofaol qilamiz. Public API
-- `is_active = TRUE` bo'yicha filtrlaydi, admin panelda esa ular ko'rinib
-- turadi va kerak bo'lsa qayta yoqiladi.

UPDATE "article_categories" c
SET "is_active" = FALSE
WHERE c."id" IN (
  'cat_hearing_health',
  'cat_audiometry',
  'cat_hearing_loss',
  'cat_hearing_aids',
  'cat_protection'
)
AND NOT EXISTS (SELECT 1 FROM "articles" a WHERE a."category_id" = c."id");
