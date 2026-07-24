/**
 * Bilim markazi namuna kontenti — 5 kategoriya + ustunli maqolalar, uz/ru/en.
 * Idempotent (ON CONFLICT). Audiolog keyin tekshirib to'ldiradi/tahrirlaydi.
 * Ishga tushirish: db:seed:catalog runner (katalog bilan birga) yoki db:seed:content.
 */

type L = { uz: string; ru: string; en: string };
const LOCALES = ["uz", "ru", "en"] as const;

const REVIEWER = "Soundz audiologiya jamoasi";
const DISCLAIMER: L = {
  uz: "Ushbu maqola faqat ma'lumot uchun. Aniq tashxis va tavsiya uchun audiolog bilan maslahatlashing.",
  ru: "Эта статья носит информационный характер. Для точного диагноза обратитесь к аудиологу.",
  en: "This article is for information only. Consult an audiologist for an accurate diagnosis.",
};
const AUTHOR: L = { uz: "Soundz audiologiya jamoasi", ru: "Команда аудиологии Soundz", en: "Soundz audiology team" };

const CATEGORIES: { slug: string; order: number; name: L; desc: L }[] = [
  { slug: "hearing-loss", order: 1,
    name: { uz: "Eshitish pasayishi", ru: "Снижение слуха", en: "Hearing loss" },
    desc: { uz: "Turlari, sabablari, belgilari va tinnitus haqida.", ru: "О типах, причинах, симптомах и тиннитусе.", en: "Types, causes, symptoms and tinnitus." } },
  { slug: "children", order: 2,
    name: { uz: "Bolalar va eshitish", ru: "Дети и слух", en: "Children & hearing" },
    desc: { uz: "Bolalarda eshitishni erta aniqlash va yordam.", ru: "Раннее выявление и помощь детям.", en: "Early detection and support for children." } },
  { slug: "hearing-aids", order: 3,
    name: { uz: "Eshitish apparatlari", ru: "Слуховые аппараты", en: "Hearing aids" },
    desc: { uz: "Qanday tanlash, moslashish va parvarish.", ru: "Как выбрать, привыкнуть и ухаживать.", en: "How to choose, adapt and care for them." } },
  { slug: "protection", order: 4,
    name: { uz: "Eshitishni himoya qilish", ru: "Защита слуха", en: "Hearing protection" },
    desc: { uz: "Shovqindan himoya, musiqachilar va ish joyi.", ru: "Защита от шума, музыканты и работа.", en: "Noise protection, musicians and the workplace." } },
  { slug: "guides", order: 5,
    name: { uz: "Qo‘llanmalar", ru: "Руководства", en: "Guides" },
    desc: { uz: "Tanlash va taqqoslash bo‘yicha amaliy qo‘llanmalar.", ru: "Практические руководства по выбору.", en: "Practical guides to choosing and comparing." } },
];

const ARTICLES: { slug: string; category: string; readMin: number; title: L; excerpt: L; content: L }[] = [
  {
    slug: "eshitish-pasayishi-belgilari", category: "hearing-loss", readMin: 5,
    title: { uz: "Eshitish pasayishining belgilari", ru: "Признаки снижения слуха", en: "Signs of hearing loss" },
    excerpt: { uz: "Eshitish pasayishini erta payqash muhim. Asosiy belgilarni bilib oling.", ru: "Важно заметить снижение слуха рано. Узнайте основные признаки.", en: "Noticing hearing loss early matters. Learn the key signs." },
    content: {
      uz: "<p>Eshitish pasayishi ko‘pincha asta-sekin rivojlanadi, shuning uchun uni darrov sezish qiyin. Ko‘p uchraydigan belgilar: suhbatdoshdan qayta-qayta so‘rash, televizor ovozini balandlatish, shovqinli joyda nutqni tushunolmaslik va telefon suhbatida qiynalish.</p><p>Agar shu belgilarni sezsangiz, eshitishni tekshirtirish tavsiya etiladi. Erta aniqlash yechimni osonlashtiradi va hayot sifatini saqlaydi. Soundz’da bepul dastlabki tekshiruvdan o‘tishingiz mumkin.</p>",
      ru: "<p>Снижение слуха часто развивается постепенно, поэтому его трудно заметить сразу. Частые признаки: переспрашивание собеседника, увеличение громкости телевизора, трудности с разборчивостью речи в шуме и при разговоре по телефону.</p><p>Если вы замечаете эти признаки, рекомендуется проверить слух. Раннее выявление упрощает решение и сохраняет качество жизни. В Soundz можно пройти бесплатную первичную проверку.</p>",
      en: "<p>Hearing loss often develops gradually, so it is hard to notice at once. Common signs include asking people to repeat themselves, turning up the TV, struggling to follow speech in noise, and difficulty on the phone.</p><p>If you notice these signs, a hearing check is recommended. Early detection makes the solution easier and preserves quality of life. At Soundz you can take a free initial check.</p>",
    },
  },
  {
    slug: "tinnitus-quloqdagi-shovqin", category: "hearing-loss", readMin: 4,
    title: { uz: "Tinnitus: quloqdagi shovqin", ru: "Тиннитус: шум в ушах", en: "Tinnitus: ringing in the ears" },
    excerpt: { uz: "Quloqda doimiy shovqin nima va u bilan qanday kurashish mumkin.", ru: "Что такое постоянный шум в ушах и как с ним справиться.", en: "What constant ear noise is and how to cope with it." },
    content: {
      uz: "<p>Tinnitus — tashqi manba bo‘lmasa ham quloqda shovqin, chiyillash yoki g‘uvillash his qilinishi. U ko‘pincha eshitish pasayishi bilan bog‘liq bo‘ladi va turli darajada bo‘lishi mumkin.</p><p>Tinnitusni to‘liq davolash har doim mumkin bo‘lmasa-da, tovush terapiyasi va zamonaviy eshitish apparatlari uni sezilarli darajada yengillashtiradi. Mutaxassis sizga mos yondashuvni tanlashga yordam beradi.</p>",
      ru: "<p>Тиннитус — это ощущение шума, звона или гула в ушах без внешнего источника. Он часто связан со снижением слуха и может проявляться в разной степени.</p><p>Хотя тиннитус не всегда удаётся полностью устранить, звуковая терапия и современные слуховые аппараты заметно облегчают его. Специалист поможет подобрать подходящий подход.</p>",
      en: "<p>Tinnitus is the perception of noise, ringing or buzzing in the ears without an external source. It is often linked to hearing loss and can vary in severity.</p><p>While tinnitus cannot always be fully removed, sound therapy and modern hearing aids relieve it significantly. A specialist will help choose the right approach for you.</p>",
    },
  },
  {
    slug: "bolalarda-eshitish-pasayishi", category: "children", readMin: 5,
    title: { uz: "Bolalarda eshitish pasayishi", ru: "Снижение слуха у детей", en: "Hearing loss in children" },
    excerpt: { uz: "Bolada eshitish muammosini qanday sezish va nima qilish kerak.", ru: "Как заметить проблему со слухом у ребёнка и что делать.", en: "How to spot a child's hearing problem and what to do." },
    content: {
      uz: "<p>Bolalarda eshitish nutq va til rivojlanishi uchun juda muhim. Chaqaloq baland ovozga javob bermasligi, ismini chaqirganda o‘girilmasligi yoki nutqi tengdoshlaridan orqada qolishi ogohlantiruvchi belgilardir.</p><p>Erta aniqlash hal qiluvchi ahamiyatga ega — qanchalik erta yordam boshlansa, natija shunchalik yaxshi bo‘ladi. Bolalar uchun maxsus eshitish apparatlari va dasturlar mavjud.</p>",
      ru: "<p>Слух у детей крайне важен для развития речи и языка. Тревожные признаки: младенец не реагирует на громкие звуки, не оборачивается на имя или отстаёт в речи от сверстников.</p><p>Раннее выявление имеет решающее значение — чем раньше начата помощь, тем лучше результат. Существуют специальные слуховые аппараты и программы для детей.</p>",
      en: "<p>Hearing is vital for a child's speech and language development. Warning signs include an infant not reacting to loud sounds, not turning to their name, or lagging behind peers in speech.</p><p>Early detection is decisive — the sooner support begins, the better the outcome. Special hearing aids and programs exist for children.</p>",
    },
  },
  {
    slug: "eshitish-apparatini-qanday-tanlash", category: "hearing-aids", readMin: 6,
    title: { uz: "Eshitish apparatini qanday tanlash", ru: "Как выбрать слуховой аппарат", en: "How to choose a hearing aid" },
    excerpt: { uz: "Forma, texnologiya darajasi va turmush tarzi bo‘yicha to‘g‘ri tanlov.", ru: "Правильный выбор по форме, уровню технологии и образу жизни.", en: "The right choice by style, technology level and lifestyle." },
    content: {
      uz: "<p>To‘g‘ri apparat eshitish darajangiz, quloq anatomiyangiz va turmush tarzingizga bog‘liq. Forma-faktor (quloq orqasi yoki quloq ichi), quvvatlanish, Bluetooth va texnologiya darajasi asosiy mezonlardir.</p><p>Premium darajalar shovqinli muhitda nutqni yaxshiroq ajratadi, bazaviy darajalar sokinroq muhitlar uchun mos. Yakuniy tanlov audiolog tekshiruvi va sinovdan keyin qilinadi — bu eng muhim qadam.</p>",
      ru: "<p>Правильный аппарат зависит от степени снижения слуха, анатомии уха и образа жизни. Основные критерии: форм-фактор (заушный или внутриушной), зарядка, Bluetooth и уровень технологии.</p><p>Премиальные уровни лучше выделяют речь в шуме, базовые подходят для более тихой обстановки. Окончательный выбор делается после проверки у аудиолога и примерки — это самый важный шаг.</p>",
      en: "<p>The right device depends on your degree of hearing loss, ear anatomy and lifestyle. Key criteria are the form factor (behind-the-ear or in-ear), charging, Bluetooth and technology level.</p><p>Premium levels separate speech in noise better; basic levels suit quieter settings. The final choice is made after an audiologist assessment and trial — the most important step.</p>",
    },
  },
  {
    slug: "eshitishni-qanday-himoya-qilish", category: "protection", readMin: 4,
    title: { uz: "Eshitishni qanday himoya qilish", ru: "Как защитить слух", en: "How to protect your hearing" },
    excerpt: { uz: "Shovqin eshitishga zarar beradi. Oddiy himoya choralari.", ru: "Шум вредит слуху. Простые меры защиты.", en: "Noise harms hearing. Simple protection measures." },
    content: {
      uz: "<p>Baland ovoz — konsert, sanoat shovqini yoki naushnikda baland musiqa — vaqt o‘tishi bilan eshitishga qaytarib bo‘lmas zarar yetkazadi. 85 detsibeldan yuqori uzoq ta’sir xavflidir.</p><p>Himoya oddiy: quloq tiqinlari yoki maxsus filtrlardan foydalaning, ovoz balandligini nazorat qiling va quloqlarga dam bering. Musiqachilar uchun individual monitoring yechimlari (IEM) ham mavjud.</p>",
      ru: "<p>Громкий звук — концерт, промышленный шум или громкая музыка в наушниках — со временем наносит необратимый вред слуху. Опасно длительное воздействие выше 85 децибел.</p><p>Защита проста: используйте беруши или специальные фильтры, контролируйте громкость и давайте ушам отдых. Для музыкантов есть индивидуальные мониторинговые решения (IEM).</p>",
      en: "<p>Loud sound — a concert, industrial noise or loud music in headphones — causes irreversible hearing damage over time. Prolonged exposure above 85 decibels is risky.</p><p>Protection is simple: use earplugs or special filters, control the volume and give your ears rest. For musicians, custom in-ear monitoring (IEM) solutions are also available.</p>",
    },
  },
  {
    slug: "oticon-resound-signia-taqqoslash", category: "guides", readMin: 6,
    title: { uz: "Oticon, ReSound, Signia — qaysi brend?", ru: "Oticon, ReSound, Signia — какой бренд?", en: "Oticon, ReSound, Signia — which brand?" },
    excerpt: { uz: "Uchta yetakchi brendning kuchli tomonlari qisqacha.", ru: "Кратко о сильных сторонах трёх ведущих брендов.", en: "A brief look at the strengths of three leading brands." },
    content: {
      uz: "<p>Har uch brend ham yuqori sifatli, ammo urg‘ulari farq qiladi. Oticon — BrainHearing yondashuvi bilan tabiiy, keng tovush manzarasi. ReSound — chuqur neyron tarmoq va Auracast ulanishi. Signia — suhbatni real vaqtda ajratish va nafis dizayn.</p><p>“Eng yaxshi brend” degani yo‘q — eng yaxshisi aynan sizga mos keladiganidir. Audiolog eshitish darajangiz va ehtiyojlaringizga qarab tavsiya beradi. Katalogimizda uch brendni ham ko‘rishingiz mumkin.</p>",
      ru: "<p>Все три бренда высокого качества, но с разными акцентами. Oticon — естественная, широкая звуковая картина с подходом BrainHearing. ReSound — глубокая нейросеть и подключение Auracast. Signia — выделение речи в реальном времени и изящный дизайн.</p><p>«Лучшего бренда» не существует — лучший тот, что подходит именно вам. Аудиолог даст рекомендацию по вашему слуху и потребностям. В нашем каталоге представлены все три бренда.</p>",
      en: "<p>All three brands are high quality but with different emphases. Oticon offers a natural, wide sound scene with its BrainHearing approach. ReSound brings a deep neural network and Auracast connectivity. Signia isolates conversation in real time with elegant design.</p><p>There is no single 'best brand' — the best is the one that fits you. An audiologist will advise based on your hearing and needs. All three brands are in our catalog.</p>",
    },
  },
];

export function contentStatements(): { text: string; values: unknown[] }[] {
  const stmts: { text: string; values: unknown[] }[] = [];

  for (const c of CATEGORIES) {
    for (const loc of LOCALES) {
      stmts.push({
        text:
          `INSERT INTO article_categories (id,slug,locale,name,description,sort_order,is_active) VALUES ($1,$2,$3,$4,$5,$6,TRUE) ` +
          `ON CONFLICT (slug,locale) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,sort_order=EXCLUDED.sort_order,is_active=TRUE,updated_at=NOW()`,
        values: [`cat-${c.slug}-${loc}`, c.slug, loc, c.name[loc], c.desc[loc], c.order],
      });
    }
  }

  for (const a of ARTICLES) {
    for (const loc of LOCALES) {
      stmts.push({
        text:
          `INSERT INTO articles (id,slug,locale,category_id,title,excerpt,content,status,author_name,reviewer_name,reading_time_minutes,medical_disclaimer,published_at) ` +
          `VALUES ($1,$2,$3,$4,$5,$6,$7,'PUBLISHED',$8,$9,$10,$11,NOW()) ` +
          `ON CONFLICT (slug,locale) DO UPDATE SET category_id=EXCLUDED.category_id,title=EXCLUDED.title,excerpt=EXCLUDED.excerpt,content=EXCLUDED.content,status='PUBLISHED',author_name=EXCLUDED.author_name,reviewer_name=EXCLUDED.reviewer_name,reading_time_minutes=EXCLUDED.reading_time_minutes,medical_disclaimer=EXCLUDED.medical_disclaimer,updated_at=NOW()`,
        values: [`art-${a.slug}-${loc}`, a.slug, loc, `cat-${a.category}-${loc}`, a.title[loc], a.excerpt[loc], a.content[loc], AUTHOR[loc], REVIEWER, a.readMin, DISCLAIMER[loc]],
      });
    }
  }

  return stmts;
}
