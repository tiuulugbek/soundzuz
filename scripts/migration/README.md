# Migration scripts

## `discover-site.mjs`

Common WordPress, WooCommerce, sitemap and robots endpointsni tekshiradi. Hisobot JSON formatda yoziladi.

## `extract-wordpress.mjs`

Ochiq REST endpointlardan pagination bilan raw JSON oladi. Har bir collection alohida fayl va umumiy manifestga yoziladi.

## Keyingi adapterlar

- authenticated WooCommerce API;
- WordPress XML;
- database dump parser;
- media downloader/hash dedupe;
- HTML sanitizer/normalizer;
- PostgreSQL staging importer;
- redirect generator;
- verification report.

## Xavfsizlik

Credentiallarni commandga yozmang. `.env` yoki secret manager ishlating. Raw exportda shaxsiy ma’lumot bo‘lishi mumkin; `data/migration` gitga kiritilmaydi.
