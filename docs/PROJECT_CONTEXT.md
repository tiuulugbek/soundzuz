# PROJECT_CONTEXT — Soundz Digital Platform

**Holat:** Boshlang‘ich tasdiqlangan kontekst  
**Sana:** 2026-07-21  
**Asosiy bozor:** O‘zbekiston

## 1. Mahsulot vizioni

Soundz uchun yangi platforma ikki yo‘nalishni yagona brend ostida boshqaradi:

1. **Eshitish moslamalari va hearing healthcare** — asosiy yo‘nalish.
2. **Custom In-Ear Monitor va professional hearing protection** — ikkilamchi yo‘nalish.

Platforma oddiy internet-do‘kon emas. Uning asosiy vazifasi foydalanuvchiga muammoni tushuntirish, mos yechimni topishga yordam berish, real mahsulot va narxlarni ko‘rsatish, filialga qabulga yozish va savdo jamoasiga sifatli lead yetkazishdir.

## 2. Tasdiqlangan biznes qoidalari

- To‘lov MVPda sayt orqali qilinmaydi; filialda amalga oshiriladi.
- Mahsulot narxi odatda ochiq ko‘rsatiladi.
- Maxsus yoki narxi o‘zgaruvchan mahsulotda `Narxini bilish` CTA ishlatilishi mumkin.
- Har bir forma PostgreSQL bazada lead yaratadi.
- Lead haqida Telegram botga bildirishnoma yuboriladi.
- Lead admin panelda ko‘rinadi va status/mas’ul bo‘yicha boshqariladi.
- Mijoz filial va bo‘sh vaqtni tanlab qabulga oldindan yozilishi mumkin.
- Custom IEM buyurtmasi markazga kelish, konsultatsiya va quloq qolipi/skan jarayonini talab qiladi.
- Mahsulotlar, filiallar, media va WordPress access keyinchalik beriladi.
- Eski sayt ma’lumotlari yangi platforma strukturasini belgilamaydi.

## 3. Maqsadli foydalanuvchilar

### Eshitish moslamalari

- eshitish pasayishini sezayotgan shaxslar;
- ota-ona yoki yaqiniga yechim izlayotgan qarindoshlar;
- 35+ yoshdagi foydalanuvchilar;
- avvalgi moslamasini yangilamoqchi bo‘lgan mijozlar;
- servis, sozlash yoki aksessuar izlayotgan mavjud mijozlar.

### Custom IEM

- xonandalar va musiqachilar;
- ovoz rejissyorlari;
- sahna ijrochilari;
- audiophiles;
- kuchli shovqindan himoya talab qiladigan professional foydalanuvchilar.

## 4. Platforma maqsadlari

- sifatli leadlar sonini ko‘paytirish;
- qabulga yozilish jarayonini raqamlashtirish;
- operatorlarning leadlarni yo‘qotishini kamaytirish;
- sotuvda bor mahsulotlar katalogini doimiy yangilash;
- filial bo‘yicha mavjudlikni ko‘rsatish;
- SEO orqali eshitish bo‘yicha organik trafikni oshirish;
- marketing manbasi va konversiyani o‘lchash;
- IEM yo‘nalishini saqlab, hearing-care yo‘nalishini asosiy qilish.

## 5. MVP tarkibi

### Public website

- Uzbek va Russian;
- homepage;
- hearing aids katalogi va product detail;
- IEM katalogi va product detail;
- xizmatlar;
- filiallar;
- qabulga yozilish;
- callback, maslahat va narx so‘rash formasi;
- blog/foydali maqolalar;
- contact, FAQ, warranty/service;
- SEO metadata, sitemap va structured data.

### Admin

- authentication;
- role/permission;
- lead list va lead detail;
- appointment calendar/list;
- Telegram notification holati;
- product/category/brand;
- branch/service/specialist;
- media;
- page/blog/FAQ;
- SEO/redirect;
- user/audit log;
- settings.

### Backend

- REST API;
- PostgreSQL;
- reliable notification outbox;
- Redis queue;
- media storage;
- audit logging;
- branch-scoped authorization;
- import review workflow.

## 6. MVPga kirmaydigan funksiyalar

- onlayn checkout va payment gateway;
- delivery logistics;
- public customer account;
- native mobile application;
- full ERP/payroll;
- AI diagnosis;
- live medical consultation;
- complex multi-tenant SaaS.

## 7. Muhim xavflar

- eski saytga access yoki uptime yo‘qligi;
- sotuvda mavjud mahsulot ma’lumotlari kechikishi;
- filiallar bo‘yicha haqiqiy slotlarni yuritish intizomi;
- Telegram’ni yagona notification kanal deb qabul qilish;
- tibbiy mazmundagi noto‘g‘ri va’dalar;
- narx/stock ma’lumotlari yangilanmasligi;
- eski URLlar yo‘qolib SEO trafik tushishi.

## 8. Muvaffaqiyat ko‘rsatkichlari

- valid lead rate;
- lead → contacted time;
- contacted → appointment conversion;
- appointment → arrived conversion;
- arrived → sale conversion;
- organic search leads;
- product page → lead conversion;
- branch response time;
- failed Telegram notification count;
- stale price/stock records.

## 9. Ochiq savollar

Mahsulot va filial ma’lumotlari kelganda aniqlanadi:

- filiallar va mutaxassislarning yakuniy ro‘yxati;
- qabul sloti davomiyligi;
- bir vaqtning o‘zida nechta qabul mumkinligi;
- mahsulot narxi filial bo‘yicha farqlanadimi;
- stock real son sifatida ko‘rsatiladimi yoki `mavjud/mavjud emas`;
- Telegram chatlar filial bo‘yicha bo‘linadimi;
- lead qaysi algoritm bilan operatorga biriktiriladi;
- CRM bilan integratsiya zarurati.
