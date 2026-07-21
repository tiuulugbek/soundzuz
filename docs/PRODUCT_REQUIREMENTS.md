# Product Requirements Document

## 1. Asosiy natija

Foydalanuvchi 2–4 daqiqada:

- kerakli yo‘nalishni topishi;
- mahsulot yoki xizmat haqida tushunarli ma’lumot olishi;
- narx va mavjudlikni ko‘rishi;
- tegishli filialni tanlashi;
- telefon orqali murojaat yoki qabul yozuvini yuborishi kerak.

Operator esa yangi leadni Telegram va admin panel orqali tez ko‘rib, statusini yurita olishi kerak.

## 2. Public forma turlari

| Forma turi | Natija | Majburiy maydonlar |
|---|---|---|
| Callback | Lead | Telefon, rozilik |
| Product interest | Lead | Telefon, productId, branch optional |
| Price request | Lead | Telefon, productId |
| Appointment | Lead + Appointment | Ism, telefon, branch, service, date/time |
| IEM consultation | Lead + optional Appointment | Ism, telefon, model optional |
| General contact | Lead | Ism, telefon yoki email, message |

Barcha formalar quyidagilarni server tomonda qo‘shadi:

- source URL;
- referrer;
- UTM fields;
- locale;
- device/client metadata minimal darajada;
- consent timestamp;
- anti-spam result.

## 3. Lead talablari

### Statuslar

- `NEW`
- `NEEDS_CONTACT`
- `CONTACTED`
- `APPOINTMENT_BOOKED`
- `VISITED`
- `SALE_COMPLETED`
- `FOLLOW_UP`
- `CANCELLED`
- `INVALID`

### Funksiyalar

- operatorga biriktirish;
- status history;
- note qo‘shish;
- follow-up sana;
- telefonni click-to-call;
- linked product/service/branch;
- duplicate phone warning;
- UTM va landing attribution;
- export;
- filter/search;
- audit trail.

## 4. Qabulga yozilish talablari

- branch tanlash;
- service tanlash;
- specialist optional;
- available date/time;
- server-side double-booking protection;
- branch timezone;
- cancellation/reschedule;
- status history;
- operator confirmation;
- appointment yaratilganda lead yaratish yoki mavjud leadga bog‘lash.

### Statuslar

- `PENDING`
- `CONFIRMED`
- `CONTACTED`
- `ARRIVED`
- `NO_SHOW`
- `RESCHEDULED`
- `CANCELLED`
- `COMPLETED`

## 5. Mahsulot talablari

### Umumiy

- category;
- brand;
- product type;
- localized name/description;
- SKU;
- media gallery;
- base price;
- old/promotional price;
- price visibility;
- availability;
- branch availability;
- attributes;
- documents;
- related/alternative products;
- SEO;
- publish state.

### Price visibility

- `PUBLIC`
- `FROM_PRICE`
- `PRICE_ON_REQUEST`
- `HIDDEN_INTERNAL`

### Availability

- `IN_STOCK`
- `SELECTED_BRANCHES`
- `ORDER_ONLY`
- `TEMPORARILY_UNAVAILABLE`
- `DISCONTINUED`
- `ARCHIVED`

### Publish state

- `DRAFT`
- `REVIEW`
- `PUBLISHED`
- `UNPUBLISHED`
- `ARCHIVED`

Legacy import hech qachon avtomatik `PUBLISHED` bo‘lmaydi.

## 6. Telegram notification

Telegram yuborish request transaction ichida to‘g‘ridan-to‘g‘ri bajarilmaydi.

```text
Database transaction
→ Lead/Appointment saved
→ OutboxEvent saved
→ Commit
→ Worker reads outbox
→ Telegram API
→ success/retry/dead-letter state
```

Admin quyidagilarni ko‘ra oladi:

- yuborildi/yuborilmadi;
- urinishlar soni;
- oxirgi xato;
- qayta yuborish.

## 7. Accessibility

- public font minimum 16px;
- asosiy CTA katta va aniq;
- keyboard navigation;
- accessible labels;
- contrast talablariga rioya;
- faqat rang orqali status bildirilmasligi;
- katta yoshdagi foydalanuvchilar uchun sodda til;
- mobil formalar qisqa.

## 8. SEO va analytics

- localized URLs;
- canonical;
- Open Graph;
- Product/Organization/LocalBusiness/Breadcrumb/FAQ structured data;
- XML sitemap;
- redirects;
- event tracking: CTA, form start, form submit, appointment success, phone click;
- UTM saqlash;
- cookie/consent talablari keyin huquqiy tekshiruv bilan yakunlanadi.

## 9. Non-functional requirements

- p95 API response target: oddiy read endpointlarda 500 ms dan past (normal load);
- public Core Web Vitals optimizatsiyasi;
- idempotent public submit endpoint;
- rate limiting;
- daily database backup;
- encrypted transport;
- secrets repositoryga kiritilmaydi;
- structured logs;
- health/readiness endpoint;
- audit-sensitive admin action loglanadi.
