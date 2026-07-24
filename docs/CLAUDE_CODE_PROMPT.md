# Soundz — Claude Code uchun ish prompti (to'liq, mustaqil)

Sen `github.com/tiuulugbek/soundzuz` monorepo'sida ishlaysan. Quyida loyiha konteksti, arxitektura, konvensiyalar, bajarilgan ishlar va keyingi vazifalar. Diqqat bilan o'qi va MUHIM konvensiyalarga qat'iy amal qil — aks holda sahifalar 404/502 beradi.

## 1. Loyiha va pozitsiya
Soundz — O'zbekistondagi eshitish salomatligi platformasi. Mahsulot: **eshitish moslamalari** (Oticon, ReSound, Signia), Custom IEM, aksessuarlar, xizmatlar. Sayt shunchaki katalog emas — **eshitish bo'yicha ishonchli ma'lumot, tekshiruv va yechim topiladigan bilim platformasi**. Shior: "Love Your Hearing". Uch til: **uz (asosiy, prefikssiz), ru, en**.
**TERMINOLOGIYA:** "qurilma" DEMA — "moslama" yoki "eshitish moslamasi" de.

## 2. Texnik stek
Turborepo monorepo, pnpm 10.15.1, Node 22.
- `apps/web` — Next.js 16 (App Router, `output: standalone`), next-intl, port 3000.
- `apps/admin` — Next.js (admin panel), port 3001.
- `apps/api` — NestJS, global prefix `/v1`, port 4000. **Katalog/kontent so'rovlari RAW SQL** (`prisma.$queryRawUnsafe`), tipli emas.
- `apps/worker` — BullMQ (Telegram xabarnoma, outbox).
- `packages/database` — Prisma + Postgres. Client `packages/database/generated/client` (CI'da `pnpm db:generate` bilan yaratiladi).
- `packages/contracts`, `packages/config`.
Deploy: Docker Compose (`docker-compose.production.yml`), image `ghcr.io/tiuulugbek/soundzuz:latest` (CI quradi), server `/var/www/soundz-new`, domen new.soundz.uz.

## 3. MUHIM konvensiyalar va tuzoqlar (buzma!)
1. **i18n marshrutlash.** Yangi sahifalar `apps/web/app/[locale]/<bo'lim>/...` da. uz — prefikssiz (`/hearing-aids`), ru/en — prefiksli (`/ru/hearing-aids`). **`apps/web/middleware.ts` matcher'iga har yangi bo'limni QO'SHISH SHART**, aks holda uz-prefikssiz sahifa 404 beradi. Hozirgi matcher `hearing-aids|learn|faq|search|services|branches` ni o'z ichiga oladi — yangi ildiz-bo'lim qo'shsang (masalan `iem`, `accessories`, `compare`, `tools`), matcher'ga ham qo'sh (statik string bo'lishi shart).
2. **Server-side (SSR) fetch ichki API'ga.** `apps/web/lib/*.ts` fetch'lari `process.env.API_INTERNAL_URL` (`http://api:4000/v1`) ishlatadi — tashqi `api.soundz.uz` bu serverda ulanmaydi. Media URL (brauzer uchun) esa `NEXT_PUBLIC_API_URL`. Yangi lib yozsang shu naqshni ishlat.
3. **Nginx 502.** Web konteyner qayta yaratilganda yangi IP oladi; Nginx statik `upstream`da eski IP'ni keshlab 502 beradi. Yechim `deploy/nginx/edge-gateway.conf` + `soundz.conf`da: `resolver 127.0.0.11` + `proxy_pass http://$o'zgaruvchi`. Deploy `scripts/deploy-zero-downtime.sh` bilan (pull → migrate → `up -d` recreate → gateway reload → tekshiruv → rollback).
4. **Ma'lumotlar modeli — per-locale qatorlar.** Product/Brand/Article/Comparison va h.k. HAR LOCALE uchun alohida qator, `@@unique([slug, locale])`. Yangi kontent seed'da kategoriya bog'lamini ID qurish orqali emas, `(SELECT id FROM ... WHERE slug=$ AND locale=$)` subquery bilan qil (mavjud content_hub kategoriyalari boshqa ID sxemasida).
5. **Mavjud kontent jadvallari.** `content_hub` migratsiyasi allaqachon `articles`, `article_categories`, `faqs`, `faq_categories` yaratgan (ContentStatus enum bilan). Ularni QAYTA yaratma — ustiga qur. `article_categories`/`faq_categories` slug endi `(slug, locale)` unique.
6. **Migratsiyalar.** Qo'lda, idempotent SQL (`CREATE TABLE IF NOT EXISTS`, `ALTER ... IF EXISTS`), `packages/database/prisma/migrations/<timestamp>_<nom>/migration.sql`. `prisma migrate deploy` bilan qo'llanadi.
7. **Dizayn tizimi.** Tokenlar `apps/web/app/tokens.css` (`--sz-orange #FF8201`, `--sz-dark #252423`, iliq yuzalar, `--sz-*`). Komponentlar `apps/web/components/ui` (Button, Section, Reveal, Marquee, WaveCanvas...). Class nomlari `sz-*`. Har sahifa `SiteHeader`/`SiteFooter`, `buildPageMetadata` (SEO+hreflang), `components/seo/json-ld` (Product/Article/FAQPage/Breadcrumb/LocalBusiness/MedicalWebPage).
8. **Namuna seed.** `pnpm db:seed:catalog` — katalog (3 brend, 9 model, xizmat, namuna filial) + Content Hub (10 kategoriya, 14 maqola, FAQ). Idempotent, admin'ga tegmaydi. Fayllar: `packages/database/prisma/catalog-sample.ts`, `content-sample.ts`, ishga tushirgich `seed-catalog-run.ts`. Namuna ma'lumot vaqtinchalik — asoschi admin orqali haqiqiysi bilan almashtiradi.

## 4. Bajarilgan (main'da, jonli)
- Dizayn tizimi, bosh sahifa, i18n, SEO infra.
- Katalog: `/[locale]/hearing-aids`, `/[locale]/hearing-aids/[brand]`, `/[locale]/hearing-aids/[brand]/[model]`. API: `catalog/products`, `catalog/filters`, `catalog/products/:slug` (spek+sharh+reyting), `catalog/brands`, `catalog/brands/:slug`. Admin API: brend/spek CRUD.
- Katalog sxema: Brand, ProductSpec, ProductRelation, Review, Comparison + `en` locale.
- Content Hub: `/[locale]/learn` (hub+qidiruv), `/learn/[category]`, `/learn/[category]/[slug]` (boy maqola: muallif, tibbiy tekshiruv, izoh, CTA), `/faq` (kategoriyali), `/search`. Content API mavjud (`content/categories|articles|faqs|search`).
- Xizmatlar/filiallar: `/[locale]/services`, `/[locale]/branches`, `/[locale]/branches/[slug]` (ish vaqti, xizmatlar, xarita, LocalBusiness schema). API `locations/branches|services`.
- Deploy: 502 tuzatildi, zero-downtime skript, middleware matcher tuzatildi, SSR ichki API URL.

## 5. Deploy va tekshirish (har o'zgarishdan keyin)
- **Lokal validatsiya:** `pnpm --filter @soundz/web build` (web); migratsiyalarni haqiqiy Postgres'da sinash; seed'ni `pg` bilan tekshirish. **Prisma engine ba'zi muhitlarda yuklanmasligi mumkin** — api'ni to'liq typecheck qilolmasang, mavjud raw-SQL naqshiga amal qil (past xavf). CI (GitHub Actions, tarmoq ochiq) `pnpm db:generate` + build + `pnpm test`ni bajaradi.
- **Push:** to'g'ridan-to'g'ri `main`'ga. CI `container.yml` `:latest` image quradi (~3 daq). CI yashil bo'lishini kut.
- **Serverda deploy:** `cd /var/www/soundz-new && git pull --ff-only origin main` so'ng `GATEWAY=<gateway-konteyner> bash scripts/deploy-zero-downtime.sh`. Kerak bo'lsa `... run --rm api pnpm db:seed:catalog`.
- Kod build/test o'tmaguncha production yangilanmasin. `docker compose down` ishlatma, volume/bazaga tegma.

## 6. Keyingi vazifalar (ustuvorlik bilan)
1. **(avval) Oxirgi deploy tasdig'i** — oxirgi commit deploy qilinib, `/hearing-aids`da 9 model va to'ldirilgan filtrlar chiqishini, havolalar `/hearing-aids`ga borishini, "Moslama" ekanini tekshir.
2. **Admin content editor** (`apps/admin`) — maqola/FAQ/kategoriya CRUD; maydonlar: sarlavha, slug, qisqa tavsif, matn (rich), kategoriya, teglar, muallif, tibbiy tekshiruvchi, asosiy rasm, video, SEO title/description, holat, nashr/yangilangan sana, tegishli mahsulot/xizmat/FAQ. Tasdiqlash oqimi: Draft → Tahrirda → Mutaxassis tekshiruvida → Tasdiqlangan → Nashr → Yangilash kerak → Arxivlangan. Tarjima holati (uz tayyor / ru kerak / ikki til tayyor). Admin API `apps/api/src/content/admin-content.controller.ts` mavjud — kengaytir.
3. **Kengaytirilgan kontent DB** — ArticleTag, ArticleTagRelation, ArticleAuthor, ArticleRevision, ContentRelatedProduct, ContentRelatedService, ContentView, SearchQuery, ContentFeedback. Migratsiya + API + admin.
4. **Katalog hublari va taqqoslash** — `/[locale]/hearing-aids/type/[ric|bte|ite|cic|iic]`, `/rechargeable`, `/bluetooth`, `/invisible`, `/for-children`, `/prices`; programmatik `/[locale]/compare/[a]-vs-[b]` (Comparison jadvali bor). SEO + ISR. Middleware matcher'ga `compare` qo'sh.
5. **Kontentni kengaytirish** — 30 ustunli maqola + 50–100 FAQ (uz asosiy, keyin ru/en). Kontent sifati qoidalari: sodda til, terminlar izohlanadi, qo'rqituvchi ibora yo'q, aniq tashxis yo'q, muallif+tekshiruvchi+sana, tibbiy ogohlantirish, kontekstga mos CTA.
6. **AI qidiruv** — foydalanuvchi oddiy tilda savol yozadi, tizim FAQAT saytdagi tasdiqlangan kontentdan (maqola/FAQ embeddings, pgvector) javob beradi; tashxis qo'ymaydi, mutaxassisga yo'naltiradi. `content/search`ni RAG bilan kengaytir.
7. **Custom IEM bo'limi** (`/[locale]/iem`) — to'q (dark) dizayn, jarayon sahifasi, galereya, auditoriya sahifalari. Middleware'ga `iem` qo'sh.
8. **Interaktiv vositalar** — onlayn eshitish testi (lead-magnit), tavsiya wizard'i, kalkulyatorlar.
9. **Haqiqiy mahsulot ma'lumoti** — asoschi Oticon/ReSound/Signia modellari + narxlarni beradi; admin import yoki seed orqali kirit (namuna ma'lumot o'rniga).

## 7. Ish uslubi
Har bo'lakni: mavjud kod naqshini o'qi → yangi dizayn tizimi + `[locale]` + 3 til + SEO bilan qur → middleware matcher + SSR API URL konvensiyalariga amal qil → `pnpm --filter @soundz/web build` va migratsiya/seed'ni Postgres'da sinash → main'ga push → CI yashil → serverda `deploy-zero-downtime.sh`. Har bosqich oxirida Lighthouse ≥95, JSON-LD validatsiya.
