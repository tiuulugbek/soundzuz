/**
 * Content Hub namuna kontenti — 10 kategoriya + ustunli maqolalar + kategoriyali FAQ, uz/ru/en.
 * Idempotent (ON CONFLICT). Audiolog keyin tekshirib to'ldiradi/tahrirlaydi.
 */

type L = { uz: string; ru: string; en: string };
const LOCALES = ["uz", "ru", "en"] as const;

const AUTHOR: L = { uz: "Soundz audiologiya jamoasi", ru: "Команда аудиологии Soundz", en: "Soundz audiology team" };
const REVIEWER = "Soundz audiologiya jamoasi";
const DISCLAIMER: L = {
  uz: "Ushbu ma'lumot umumiy tushuntirish uchun berilgan va individual tibbiy tashxis o'rnini bosmaydi.",
  ru: "Эта информация носит общий характер и не заменяет индивидуальный медицинский диагноз.",
  en: "This information is general and does not replace an individual medical diagnosis.",
};

const CATEGORIES: { slug: string; order: number; name: L; desc: L }[] = [
  { slug: "hearing-health", order: 1, name: { uz: "Eshitish salomatligi", ru: "Здоровье слуха", en: "Hearing health" }, desc: { uz: "Eshitish qanday ishlaydi va uni qanday asrash mumkin.", ru: "Как работает слух и как его сохранить.", en: "How hearing works and how to protect it." } },
  { slug: "audiometry", order: 2, name: { uz: "Audiometriya", ru: "Аудиометрия", en: "Audiometry" }, desc: { uz: "Eshitishni tekshirish va audiogrammani tushunish.", ru: "Проверка слуха и понимание аудиограммы.", en: "Hearing tests and understanding the audiogram." } },
  { slug: "hearing-loss", order: 3, name: { uz: "Eshitish pasayishi", ru: "Снижение слуха", en: "Hearing loss" }, desc: { uz: "Turlari, darajalari, belgilari va sabablari.", ru: "Типы, степени, признаки и причины.", en: "Types, degrees, signs and causes." } },
  { slug: "hearing-aids", order: 4, name: { uz: "Eshitish moslamalari", ru: "Слуховые аппараты", en: "Hearing aids" }, desc: { uz: "Qanday ishlaydi, tanlash va turlari.", ru: "Как работают, выбор и типы.", en: "How they work, choosing and types." } },
  { slug: "children", order: 5, name: { uz: "Bolalarda eshitish", ru: "Слух у детей", en: "Children's hearing" }, desc: { uz: "Erta aniqlash va bolalarga yordam.", ru: "Раннее выявление и помощь детям.", en: "Early detection and support for children." } },
  { slug: "seniors", order: 6, name: { uz: "Keksalarda eshitish", ru: "Слух у пожилых", en: "Hearing in seniors" }, desc: { uz: "Yoshga bog'liq pasayish va yechimlar.", ru: "Возрастное снижение и решения.", en: "Age-related loss and solutions." } },
  { slug: "protection", order: 7, name: { uz: "Quloqni shovqindan himoyalash", ru: "Защита от шума", en: "Noise protection" }, desc: { uz: "Shovqindan himoya: ish, konsert, musiqachilar.", ru: "Защита от шума: работа, концерты, музыканты.", en: "Noise protection: work, concerts, musicians." } },
  { slug: "tinnitus", order: 8, name: { uz: "Tinnitus", ru: "Тиннитус", en: "Tinnitus" }, desc: { uz: "Quloqdagi shovqin: sabablari va yechimlari.", ru: "Шум в ушах: причины и решения.", en: "Ear noise: causes and solutions." } },
  { slug: "care", order: 9, name: { uz: "Moslamani parvarishlash", ru: "Уход за аппаратом", en: "Device care" }, desc: { uz: "Tozalash, batareya, namlik va hushtak.", ru: "Чистка, батарея, влага и свист.", en: "Cleaning, battery, moisture and whistling." } },
  { slug: "iem", order: 10, name: { uz: "Custom In-Ear Monitor", ru: "Custom In-Ear Monitor", en: "Custom In-Ear Monitor" }, desc: { uz: "Musiqachilar uchun individual monitoring.", ru: "Индивидуальный мониторинг для музыкантов.", en: "Custom monitoring for musicians." } },
];

const ARTICLES: { slug: string; category: string; readMin: number; title: L; excerpt: L; content: L }[] = [
  {
    slug: "audiometriya-nima", category: "audiometry", readMin: 6,
    title: { uz: "Audiometriya nima?", ru: "Что такое аудиометрия?", en: "What is audiometry?" },
    excerpt: { uz: "Eshitishni baholovchi og'riqsiz tekshiruv — qanday o'tadi va nima aniqlanadi.", ru: "Безболезненная проверка слуха — как проходит и что выявляет.", en: "A painless hearing assessment — how it works and what it reveals." },
    content: {
      uz: "<p>Audiometriya — eshitish qobiliyatini baholaydigan og'riqsiz tekshiruv. U turli chastota va balandlikdagi tovushlarni qanchalik yaxshi eshitishingizni aniqlaydi.</p><h2>Nima uchun kerak?</h2><p>Eshitish pasayishini aniqlash, uning darajasi va turini belgilash hamda to'g'ri yechim tanlash uchun kerak.</p><h2>Qanday o'tadi?</h2><p>Siz maxsus naushnik taqasiz va tovush eshitilganda tugma bosasiz. Tekshiruv sokin xonada o'tkaziladi va odatda 15–30 daqiqa davom etadi. U mutlaqo og'riqsiz.</p><h2>Natijada nima aniqlanadi?</h2><p>Natija <strong>audiogramma</strong> ko'rinishida chiqadi — bu har bir quloq uchun eshitish darajasini ko'rsatuvchi grafik. Uning asosida mutaxassis tavsiya beradi.</p><h2>Qachon murojaat qilish kerak?</h2><p>Agar suhbatni qayta so'rasangiz, TV ovozini balandlatsangiz yoki shovqinli joyda nutqni tushunolmasangiz — eshitishni tekshirtiring.</p>",
      ru: "<p>Аудиометрия — это безболезненная проверка, оценивающая слух. Она определяет, насколько хорошо вы слышите звуки разной частоты и громкости.</p><h2>Зачем нужна?</h2><p>Чтобы выявить снижение слуха, определить его степень и тип и подобрать правильное решение.</p><h2>Как проходит?</h2><p>Вы надеваете наушники и нажимаете кнопку, когда слышите звук. Проверка проходит в тихой комнате и обычно длится 15–30 минут. Она совершенно безболезненна.</p><h2>Что выявляет?</h2><p>Результат — <strong>аудиограмма</strong>, график уровня слуха для каждого уха. На его основе специалист даёт рекомендацию.</p><h2>Когда обращаться?</h2><p>Если вы переспрашиваете, увеличиваете громкость ТВ или не разбираете речь в шуме — проверьте слух.</p>",
      en: "<p>Audiometry is a painless test that assesses hearing. It measures how well you hear sounds of different frequency and loudness.</p><h2>Why is it needed?</h2><p>To detect hearing loss, determine its degree and type, and choose the right solution.</p><h2>How does it work?</h2><p>You wear headphones and press a button when you hear a sound. It takes place in a quiet room and usually lasts 15–30 minutes. It is completely painless.</p><h2>What does it reveal?</h2><p>The result is an <strong>audiogram</strong>, a graph of hearing level for each ear. A specialist advises based on it.</p><h2>When to seek help?</h2><p>If you ask people to repeat, turn up the TV, or cannot follow speech in noise — get your hearing checked.</p>",
    },
  },
  {
    slug: "audiogramma-qanday-oqiladi", category: "audiometry", readMin: 5,
    title: { uz: "Audiogramma qanday o'qiladi?", ru: "Как читать аудиограмму?", en: "How to read an audiogram" },
    excerpt: { uz: "Audiogrammadagi chiziqlar va raqamlar nimani anglatadi.", ru: "Что означают линии и цифры на аудиограмме.", en: "What the lines and numbers on an audiogram mean." },
    content: {
      uz: "<p>Audiogramma — eshitish tekshiruvi natijasini ko'rsatuvchi grafik. Gorizontal o'q chastotani (past–baland tovush), vertikal o'q esa balandlikni (detsibel) bildiradi.</p><p>Chiziq qanchalik pastda bo'lsa, eshitish shunchalik ko'p pasaygan. Odatda 0–25 dB — normal, 26–40 yengil, 41–70 o'rta, 71–90 og'ir, 90+ chuqur pasayish deb baholanadi. Aniq izohni har doim mutaxassis beradi.</p>",
      ru: "<p>Аудиограмма — график с результатом проверки слуха. Горизонтальная ось — частота (низкие–высокие звуки), вертикальная — громкость (децибелы).</p><p>Чем ниже линия, тем сильнее снижение слуха. Обычно 0–25 дБ — норма, 26–40 лёгкое, 41–70 среднее, 71–90 тяжёлое, 90+ глубокое снижение. Точную трактовку всегда даёт специалист.</p>",
      en: "<p>An audiogram is a graph of hearing test results. The horizontal axis is frequency (low–high sounds), the vertical axis is loudness (decibels).</p><p>The lower the line, the greater the hearing loss. Typically 0–25 dB is normal, 26–40 mild, 41–70 moderate, 71–90 severe, 90+ profound. A specialist always gives the exact interpretation.</p>",
    },
  },
  {
    slug: "eshitish-pasayishi-belgilari", category: "hearing-loss", readMin: 5,
    title: { uz: "Eshitish pasayishining belgilari", ru: "Признаки снижения слуха", en: "Signs of hearing loss" },
    excerpt: { uz: "Eshitish pasayishini erta payqash muhim. Asosiy belgilar.", ru: "Важно заметить снижение слуха рано. Основные признаки.", en: "Noticing hearing loss early matters. The key signs." },
    content: {
      uz: "<p>Eshitish pasayishi ko'pincha asta-sekin rivojlanadi. Ko'p uchraydigan belgilar: suhbatdoshdan qayta-qayta so'rash, televizor ovozini balandlatish, shovqinli joyda nutqni tushunolmaslik va telefon suhbatida qiynalish.</p><p>Shu belgilarni sezsangiz, eshitishni tekshirtirish tavsiya etiladi. Erta aniqlash yechimni osonlashtiradi. Soundz'da bepul dastlabki tekshiruvdan o'tishingiz mumkin.</p>",
      ru: "<p>Снижение слуха часто развивается постепенно. Частые признаки: переспрашивание, увеличение громкости ТВ, трудности с речью в шуме и по телефону.</p><p>Если замечаете эти признаки, проверьте слух. Раннее выявление упрощает решение. В Soundz можно пройти бесплатную первичную проверку.</p>",
      en: "<p>Hearing loss often develops gradually. Common signs: asking people to repeat, turning up the TV, struggling with speech in noise and on the phone.</p><p>If you notice these signs, get a hearing check. Early detection makes the solution easier. At Soundz you can take a free initial check.</p>",
    },
  },
  {
    slug: "eshitish-pasayishi-darajalari", category: "hearing-loss", readMin: 4,
    title: { uz: "Eshitish pasayishining darajalari", ru: "Степени снижения слуха", en: "Degrees of hearing loss" },
    excerpt: { uz: "Yengildan chuqurgacha — darajalar va ular nimani anglatadi.", ru: "От лёгкой до глубокой — степени и их значение.", en: "From mild to profound — the degrees and what they mean." },
    content: {
      uz: "<p>Eshitish pasayishi darajalarga bo'linadi: yengil (26–40 dB), o'rta (41–70 dB), og'ir (71–90 dB) va chuqur (90+ dB). Har daraja uchun mos yechim va apparat quvvati farq qiladi.</p><p>Yengil darajada tovushning ba'zi qismlari, og'ir darajada esa nutqning katta qismi yo'qoladi. Daraja audiometriya orqali aniqlanadi va yechim shunga qarab tanlanadi.</p>",
      ru: "<p>Снижение слуха делится на степени: лёгкая (26–40 дБ), средняя (41–70 дБ), тяжёлая (71–90 дБ) и глубокая (90+ дБ). Для каждой степени подходят разные решения и мощность аппарата.</p><p>При лёгкой теряются части звука, при тяжёлой — большая часть речи. Степень определяется аудиометрией, и решение подбирается соответственно.</p>",
      en: "<p>Hearing loss is graded: mild (26–40 dB), moderate (41–70 dB), severe (71–90 dB) and profound (90+ dB). Each degree calls for a different solution and device power.</p><p>Mild loss drops parts of sound; severe loss drops much of speech. The degree is found via audiometry and the solution chosen accordingly.</p>",
    },
  },
  {
    slug: "tinnitus-quloqdagi-shovqin", category: "tinnitus", readMin: 4,
    title: { uz: "Tinnitus: quloqdagi shovqin", ru: "Тиннитус: шум в ушах", en: "Tinnitus: ringing in the ears" },
    excerpt: { uz: "Quloqda doimiy shovqin nima va u bilan qanday kurashish mumkin.", ru: "Что такое постоянный шум в ушах и как с ним справиться.", en: "What constant ear noise is and how to cope with it." },
    content: {
      uz: "<p>Tinnitus — tashqi manba bo'lmasa ham quloqda shovqin, chiyillash yoki g'uvillash his qilinishi. U ko'pincha eshitish pasayishi bilan bog'liq.</p><p>Tovush terapiyasi va zamonaviy eshitish apparatlari tinnitusni sezilarli yengillashtiradi. Mutaxassis sizga mos yondashuvni tanlashga yordam beradi.</p>",
      ru: "<p>Тиннитус — ощущение шума, звона или гула в ушах без внешнего источника. Часто связан со снижением слуха.</p><p>Звуковая терапия и современные аппараты заметно облегчают тиннитус. Специалист поможет подобрать подход.</p>",
      en: "<p>Tinnitus is the perception of noise, ringing or buzzing without an external source. It is often linked to hearing loss.</p><p>Sound therapy and modern hearing aids relieve tinnitus significantly. A specialist helps choose the right approach.</p>",
    },
  },
  {
    slug: "bolalarda-eshitish-pasayishi", category: "children", readMin: 5,
    title: { uz: "Bolalarda eshitish pasayishi", ru: "Снижение слуха у детей", en: "Hearing loss in children" },
    excerpt: { uz: "Bolada eshitish muammosini qanday sezish va nima qilish kerak.", ru: "Как заметить проблему со слухом у ребёнка.", en: "How to spot a child's hearing problem." },
    content: {
      uz: "<p>Bolalarda eshitish nutq va til rivojlanishi uchun muhim. Ogohlantiruvchi belgilar: chaqaloq baland ovozga javob bermasligi, ismini chaqirganda o'girilmasligi yoki nutqi orqada qolishi.</p><p>Erta aniqlash hal qiluvchi ahamiyatga ega. Bolalar uchun maxsus apparatlar va dasturlar mavjud.</p>",
      ru: "<p>Слух важен для развития речи ребёнка. Тревожные признаки: не реагирует на громкие звуки, не оборачивается на имя, отстаёт в речи.</p><p>Раннее выявление решающе. Есть специальные аппараты и программы для детей.</p>",
      en: "<p>Hearing is vital for a child's speech development. Warning signs: not reacting to loud sounds, not turning to their name, lagging in speech.</p><p>Early detection is decisive. Special hearing aids and programs exist for children.</p>",
    },
  },
  {
    slug: "keksalarda-eshitish-pasayishi", category: "seniors", readMin: 4,
    title: { uz: "Keksalarda eshitish pasayishi", ru: "Снижение слуха у пожилых", en: "Hearing loss in older adults" },
    excerpt: { uz: "Yoshga bog'liq eshitish pasayishi va uni bartaraf etish.", ru: "Возрастное снижение слуха и его решение.", en: "Age-related hearing loss and how to address it." },
    content: {
      uz: "<p>Yosh ortishi bilan eshitish tabiiy ravishda pasayadi (presbiakuziya). Bu ko'pincha ikkala quloqda bir xil kechadi va baland chastotalarni birinchi ta'sirlaydi.</p><p>Davolanmagan pasayish muloqotni kamaytiradi va xotira bilan bog'liq bo'lishi mumkin. Zamonaviy apparatlar hayot sifatini sezilarli yaxshilaydi — mutaxassis yechim tanlashga yordam beradi.</p>",
      ru: "<p>С возрастом слух естественно снижается (пресбиакузис). Часто одинаково на обоих ушах и в первую очередь затрагивает высокие частоты.</p><p>Нелеченое снижение уменьшает общение и может быть связано с памятью. Современные аппараты заметно улучшают качество жизни — специалист поможет с выбором.</p>",
      en: "<p>Hearing naturally declines with age (presbycusis). It often affects both ears equally and hits high frequencies first.</p><p>Untreated loss reduces communication and may be linked to memory. Modern devices markedly improve quality of life — a specialist helps choose.</p>",
    },
  },
  {
    slug: "eshitish-apparatini-qanday-tanlash", category: "hearing-aids", readMin: 6,
    title: { uz: "Eshitish apparatini qanday tanlash", ru: "Как выбрать слуховой аппарат", en: "How to choose a hearing aid" },
    excerpt: { uz: "Forma, texnologiya darajasi va turmush tarzi bo'yicha to'g'ri tanlov.", ru: "Правильный выбор по форме, технологии и образу жизни.", en: "The right choice by style, technology and lifestyle." },
    content: {
      uz: "<p>To'g'ri apparat eshitish darajangiz, quloq anatomiyangiz va turmush tarzingizga bog'liq. Forma-faktor, quvvatlanish, Bluetooth va texnologiya darajasi asosiy mezonlardir.</p><p>Premium darajalar shovqinli muhitda nutqni yaxshiroq ajratadi. Yakuniy tanlov audiolog tekshiruvi va sinovdan keyin qilinadi — bu eng muhim qadam.</p>",
      ru: "<p>Правильный аппарат зависит от степени снижения, анатомии уха и образа жизни. Основные критерии: форм-фактор, зарядка, Bluetooth и уровень технологии.</p><p>Премиальные уровни лучше выделяют речь в шуме. Окончательный выбор — после проверки у аудиолога и примерки.</p>",
      en: "<p>The right device depends on your degree of loss, ear anatomy and lifestyle. Key criteria: form factor, charging, Bluetooth and technology level.</p><p>Premium levels separate speech in noise better. The final choice comes after an audiologist assessment and trial.</p>",
    },
  },
  {
    slug: "bte-ric-cic-farqi", category: "hearing-aids", readMin: 5,
    title: { uz: "BTE, RIC va CIC farqi", ru: "Разница BTE, RIC и CIC", en: "BTE, RIC and CIC explained" },
    excerpt: { uz: "Quloq orqasi va quloq ichi moslamalar qanday farq qiladi.", ru: "Чем отличаются заушные и внутриушные аппараты.", en: "How behind-the-ear and in-ear devices differ." },
    content: {
      uz: "<p><strong>BTE</strong> (quloq orqasi) — kuchli va ishonchli, barcha darajalar uchun. <strong>RIC</strong> — ixcham, tabiiy tovushli, eng commat variant. <strong>CIC</strong> (quloq ichida) — deyarli ko'rinmas, yengil–o'rta darajalar uchun.</p><p>Tanlov eshitish darajasi, epchillik va estetik afzalliklarga bog'liq. Mutaxassis quloq anatomiyangizga qarab mos formani tavsiya qiladi.</p>",
      ru: "<p><strong>BTE</strong> (заушный) — мощный и надёжный, для всех степеней. <strong>RIC</strong> — компактный, естественный звук, самый популярный. <strong>CIC</strong> (внутриканальный) — почти незаметный, для лёгкой–средней степени.</p><p>Выбор зависит от степени, ловкости рук и эстетики. Специалист подберёт форму по анатомии уха.</p>",
      en: "<p><strong>BTE</strong> (behind-the-ear) is powerful and reliable, for all degrees. <strong>RIC</strong> is compact with natural sound, the most popular. <strong>CIC</strong> (in-canal) is nearly invisible, for mild–moderate loss.</p><p>The choice depends on degree, dexterity and aesthetics. A specialist recommends the form by your ear anatomy.</p>",
    },
  },
  {
    slug: "eshitish-moslamasini-tozalash", category: "care", readMin: 4,
    title: { uz: "Eshitish moslamasini qanday tozalash kerak?", ru: "Как чистить слуховой аппарат?", en: "How to clean a hearing aid" },
    excerpt: { uz: "Kundalik parvarish moslama umrini uzaytiradi.", ru: "Ежедневный уход продлевает срок службы аппарата.", en: "Daily care extends the device's life." },
    content: {
      uz: "<p>Moslamani har kuni yumshoq quruq mato bilan arting. Quloq surug'i to'planadigan filtr va domlarni muntazam tekshiring va kerak bo'lsa almashtiring. Suv yoki spirt ishlatmang.</p><p>Kechasi moslamani quritish qutisida saqlang — bu namlikni oldini oladi. Har qanday muammoda servisga murojaat qiling.</p>",
      ru: "<p>Ежедневно протирайте аппарат мягкой сухой салфеткой. Регулярно проверяйте фильтр и вкладыши, где скапливается сера, и меняйте при необходимости. Не используйте воду или спирт.</p><p>На ночь храните аппарат в сушильном боксе — это предотвращает влагу. При любых проблемах обращайтесь в сервис.</p>",
      en: "<p>Wipe the device daily with a soft dry cloth. Regularly check the wax filter and domes and replace them when needed. Do not use water or alcohol.</p><p>Store the device in a drying box overnight to prevent moisture. For any issue, contact service.</p>",
    },
  },
  {
    slug: "moslama-hushtak-chalishi", category: "care", readMin: 3,
    title: { uz: "Moslama hushtak chalishining sabablari", ru: "Почему аппарат свистит", en: "Why a hearing aid whistles" },
    excerpt: { uz: "Hushtak (feedback) nega bo'ladi va nima qilish kerak.", ru: "Почему возникает свист (обратная связь) и что делать.", en: "Why whistling (feedback) happens and what to do." },
    content: {
      uz: "<p>Hushtak ko'pincha moslama quloqqa yaxshi o'tirmagani, dom o'lchami noto'g'ri yoki quloq surug'i to'planganidan bo'ladi. Ba'zan sozlash ham talab qilinadi.</p><p>Domni to'g'ri joylang, quloqni tekshiring; muammo davom etsa — servisga murojaat qiling, mutaxassis sozlab beradi.</p>",
      ru: "<p>Свист часто возникает из-за неплотной посадки, неверного размера вкладыша или скопления серы. Иногда нужна настройка.</p><p>Правильно вставьте вкладыш, проверьте ухо; если проблема сохраняется — обратитесь в сервис для настройки.</p>",
      en: "<p>Whistling often comes from a loose fit, the wrong dome size or wax buildup. Sometimes tuning is needed.</p><p>Seat the dome properly and check the ear; if it persists, contact service for adjustment.</p>",
    },
  },
  {
    slug: "eshitishni-qanday-himoya-qilish", category: "protection", readMin: 4,
    title: { uz: "Eshitishni qanday himoya qilish", ru: "Как защитить слух", en: "How to protect your hearing" },
    excerpt: { uz: "Shovqin eshitishga zarar beradi. Oddiy himoya choralari.", ru: "Шум вредит слуху. Простые меры защиты.", en: "Noise harms hearing. Simple protection measures." },
    content: {
      uz: "<p>Baland ovoz vaqt o'tishi bilan eshitishga qaytarib bo'lmas zarar yetkazadi. 85 detsibeldan yuqori uzoq ta'sir xavflidir.</p><p>Quloq tiqinlari yoki filtrlardan foydalaning, ovoz balandligini nazorat qiling va quloqlarga dam bering. Musiqachilar uchun IEM yechimlari mavjud.</p>",
      ru: "<p>Громкий звук со временем наносит необратимый вред слуху. Опасно длительное воздействие выше 85 дБ.</p><p>Используйте беруши или фильтры, контролируйте громкость и давайте ушам отдых. Для музыкантов есть IEM-решения.</p>",
      en: "<p>Loud sound causes irreversible hearing damage over time. Prolonged exposure above 85 dB is risky.</p><p>Use earplugs or filters, control the volume and rest your ears. For musicians, IEM solutions are available.</p>",
    },
  },
  {
    slug: "custom-iem-nima", category: "iem", readMin: 4,
    title: { uz: "Custom In-Ear Monitor (IEM) nima?", ru: "Что такое Custom In-Ear Monitor?", en: "What is a Custom In-Ear Monitor?" },
    excerpt: { uz: "Musiqachilar va sahna uchun individual quloq monitori.", ru: "Индивидуальный ушной монитор для музыкантов и сцены.", en: "A custom ear monitor for musicians and the stage." },
    content: {
      uz: "<p>Custom IEM — quloq qolipiga individual quyiladigan monitor. U sahna shovqinini izolyatsiya qilib, tovushni aniq va xavfsiz balandlikda yetkazadi.</p><p>Musiqachilar, ovoz muhandislari va audiofillar uchun ideal. Jarayon quloq qolipini olishdan boshlanadi — Soundz IEM bo'limida batafsil.</p>",
      ru: "<p>Custom IEM — индивидуально изготавливаемый по слепку ушной монитор. Он изолирует сценический шум и передаёт звук чётко на безопасной громкости.</p><p>Идеален для музыкантов, звукоинженеров и аудиофилов. Процесс начинается со слепка уха — подробнее в разделе IEM.</p>",
      en: "<p>A Custom IEM is a monitor made individually from an ear impression. It isolates stage noise and delivers sound clearly at a safe volume.</p><p>Ideal for musicians, sound engineers and audiophiles. The process starts with an ear impression — more in the IEM section.</p>",
    },
  },
  {
    slug: "eshitishni-asrash-10-usul", category: "hearing-health", readMin: 5,
    title: { uz: "Eshitishni asrashning 10 usuli", ru: "10 способов сохранить слух", en: "10 ways to protect your hearing" },
    excerpt: { uz: "Kundalik odatlar bilan eshitishingizni yillar davomida asrang.", ru: "Сохраните слух на годы с помощью простых привычек.", en: "Keep your hearing for years with simple habits." },
    content: {
      uz: "<p>Eshitishni asrash oddiy odatlardan boshlanadi: ovoz balandligini nazorat qilish, shovqinli joyda quloq tiqini taqish, naushnikda 60% qoidasiga amal qilish va quloqlarga dam berish.</p><p>Shuningdek, quloqni paxta cho'pi bilan tozalamang, kasalliklarni o'z vaqtida davolang va yiliga bir marta eshitishni tekshirtiring. Erta e'tibor — eng yaxshi profilaktika.</p>",
      ru: "<p>Сохранение слуха начинается с простых привычек: контроль громкости, беруши в шуме, правило 60% в наушниках и отдых для ушей.</p><p>Также не чистите уши ватными палочками, вовремя лечите болезни и раз в год проверяйте слух. Раннее внимание — лучшая профилактика.</p>",
      en: "<p>Protecting hearing starts with simple habits: control volume, wear earplugs in noise, follow the 60% rule with headphones, and rest your ears.</p><p>Also, don't clean ears with cotton swabs, treat illnesses promptly, and check your hearing yearly. Early attention is the best prevention.</p>",
    },
  },
];

const FAQ_CATEGORIES: { slug: string; order: number; name: L }[] = [
  { slug: "faq-audiometry", order: 1, name: { uz: "Audiometriya haqida", ru: "Об аудиометрии", en: "About audiometry" } },
  { slug: "faq-devices", order: 2, name: { uz: "Eshitish moslamalari haqida", ru: "О слуховых аппаратах", en: "About hearing aids" } },
  { slug: "faq-prices", order: 3, name: { uz: "Narxlar haqida", ru: "О ценах", en: "About prices" } },
  { slug: "faq-appointments", order: 4, name: { uz: "Qabul va filiallar", ru: "Приём и филиалы", en: "Appointments & branches" } },
  { slug: "faq-usage", order: 5, name: { uz: "Moslamadan foydalanish", ru: "Использование аппарата", en: "Using the device" } },
  { slug: "faq-children", order: 6, name: { uz: "Bolalar eshitishi", ru: "Слух у детей", en: "Children's hearing" } },
  { slug: "faq-tinnitus", order: 7, name: { uz: "Tinnitus", ru: "Тиннитус", en: "Tinnitus" } },
  { slug: "faq-service", order: 8, name: { uz: "Ta'mirlash va servis", ru: "Ремонт и сервис", en: "Repair & service" } },
];

const FAQS: { slug: string; category: string; order: number; q: L; a: L }[] = [
  { slug: "audiometriya-ogriqlimi", category: "faq-audiometry", order: 1,
    q: { uz: "Audiometriya og'riqlimi?", ru: "Аудиометрия болезненна?", en: "Is audiometry painful?" },
    a: { uz: "Yo'q. Audiometriya og'riqsiz tekshiruv bo'lib, turli chastota va balandlikdagi tovushlarni eshitish qobiliyatini baholaydi.", ru: "Нет. Аудиометрия — безболезненная проверка, оценивающая слух на разных частотах и громкостях.", en: "No. Audiometry is a painless test that assesses hearing across frequencies and loudness." } },
  { slug: "audiometriya-qancha-vaqt", category: "faq-audiometry", order: 2,
    q: { uz: "Audiometriya qancha vaqt oladi?", ru: "Сколько длится аудиометрия?", en: "How long does audiometry take?" },
    a: { uz: "Odatda 15–30 daqiqa. Natija darhol audiogramma ko'rinishida beriladi.", ru: "Обычно 15–30 минут. Результат сразу выдаётся в виде аудиограммы.", en: "Usually 15–30 minutes. The result is given immediately as an audiogram." } },
  { slug: "moslamani-shifokorsiz-sotib-olsa", category: "faq-devices", order: 1,
    q: { uz: "Eshitish moslamasini shifokorsiz sotib olsa bo'ladimi?", ru: "Можно ли купить аппарат без врача?", en: "Can I buy a hearing aid without a specialist?" },
    a: { uz: "Texnik jihatdan ayrim qurilmalarni sotib olish mumkin, lekin moslama audiometriya natijasi va individual sozlash asosida tanlanganda samaraliroq bo'ladi.", ru: "Технически некоторые устройства купить можно, но аппарат эффективнее, когда подобран по аудиометрии и индивидуально настроен.", en: "Technically some devices can be bought, but a hearing aid works better when chosen by audiometry and individually tuned." } },
  { slug: "moslama-eshitishni-yomonlashtiradimi", category: "faq-devices", order: 2,
    q: { uz: "Moslama taqish eshitishni yanada yomonlashtiradimi?", ru: "Ухудшает ли аппарат слух?", en: "Does wearing a device worsen hearing?" },
    a: { uz: "To'g'ri tanlangan va mutaxassis sozlagan moslama odatda eshitishni yomonlashtirmaydi. Noto'g'ri kuchaytirish esa noqulaylik tug'dirishi mumkin.", ru: "Правильно подобранный и настроенный специалистом аппарат обычно не ухудшает слух. Неверное усиление может вызвать дискомфорт.", en: "A properly chosen and professionally tuned device usually does not worsen hearing. Incorrect amplification can cause discomfort." } },
  { slug: "moslama-narxi-nimaga-bogliq", category: "faq-prices", order: 1,
    q: { uz: "Eshitish moslamasi narxi nimaga bog'liq?", ru: "От чего зависит цена аппарата?", en: "What does a hearing aid's price depend on?" },
    a: { uz: "Narx texnologiya darajasi, kanallar soni, shovqinni kamaytirish, Bluetooth, zaryadlash, model turi va boshqa imkoniyatlarga bog'liq.", ru: "Цена зависит от уровня технологии, числа каналов, шумоподавления, Bluetooth, зарядки, типа модели и других возможностей.", en: "The price depends on technology level, number of channels, noise reduction, Bluetooth, charging, model type and other features." } },
  { slug: "qabulga-qanday-yozilaman", category: "faq-appointments", order: 1,
    q: { uz: "Qabulga qanday yozilaman?", ru: "Как записаться на приём?", en: "How do I book an appointment?" },
    a: { uz: "Saytdagi \"Qabulga yozilish\" tugmasi orqali yoki filialga qo'ng'iroq qilib yozilishingiz mumkin. Dastlabki tekshiruv bepul.", ru: "Через кнопку «Записаться» на сайте или позвонив в филиал. Первичная проверка бесплатна.", en: "Via the \"Book\" button on the site or by calling a branch. The initial check is free." } },
  { slug: "moslashish-qancha-vaqt", category: "faq-usage", order: 1,
    q: { uz: "Moslamaga ko'nikish qancha davom etadi?", ru: "Сколько длится привыкание к аппарату?", en: "How long does it take to adapt?" },
    a: { uz: "Odatda bir necha hafta. Miya yangi tovushlarga bosqichma-bosqich ko'nikadi; mutaxassis sozlashni moslab boradi.", ru: "Обычно несколько недель. Мозг постепенно привыкает к новым звукам; специалист корректирует настройку.", en: "Usually a few weeks. The brain gradually adapts to new sounds; the specialist fine-tunes the settings." } },
  { slug: "bola-eshitishini-qachon-tekshirtirish", category: "faq-children", order: 1,
    q: { uz: "Bolaning eshitishini qachon tekshirtirish kerak?", ru: "Когда проверять слух ребёнка?", en: "When should a child's hearing be checked?" },
    a: { uz: "Shubha bo'lsa imkon qadar erta. Bola ismiga javob bermasligi yoki nutqi orqada qolishi — tekshiruv uchun sabab.", ru: "При сомнениях — как можно раньше. Если ребёнок не отзывается на имя или отстаёт в речи — повод проверить.", en: "As early as possible if in doubt. If a child doesn't respond to their name or lags in speech — reason to check." } },
  { slug: "tinnitus-davolanadimi", category: "faq-tinnitus", order: 1,
    q: { uz: "Tinnitus davolanadimi?", ru: "Лечится ли тиннитус?", en: "Can tinnitus be treated?" },
    a: { uz: "Har doim to'liq yo'qotib bo'lmaydi, lekin tovush terapiyasi va eshitish apparatlari uni sezilarli yengillashtiradi. Mutaxassis yondashuvni tanlaydi.", ru: "Не всегда устраняется полностью, но звуковая терапия и аппараты заметно облегчают. Специалист подбирает подход.", en: "Not always fully eliminated, but sound therapy and hearing aids relieve it significantly. A specialist chooses the approach." } },
  { slug: "moslama-buzilsa-nima-qilish", category: "faq-service", order: 1,
    q: { uz: "Moslama buzilsa nima qilish kerak?", ru: "Что делать, если аппарат сломался?", en: "What if the device breaks?" },
    a: { uz: "Servisimizga murojaat qiling — tekshirib, ta'mirlab yoki kafolat asosida almashtirib beramiz. O'zingiz ochishga urinmang.", ru: "Обратитесь в наш сервис — проверим, отремонтируем или заменим по гарантии. Не вскрывайте самостоятельно.", en: "Contact our service — we'll check, repair or replace under warranty. Do not open it yourself." } },
];

export function contentStatements(): { text: string; values: unknown[] }[] {
  const stmts: { text: string; values: unknown[] }[] = [];

  for (const c of CATEGORIES) {
    for (const loc of LOCALES) {
      stmts.push({
        text: `INSERT INTO article_categories (id,slug,locale,name,description,sort_order,is_active) VALUES ($1,$2,$3,$4,$5,$6,TRUE) ON CONFLICT (slug,locale) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,sort_order=EXCLUDED.sort_order,is_active=TRUE,updated_at=NOW()`,
        values: [`cat-${c.slug}-${loc}`, c.slug, loc, c.name[loc], c.desc[loc], c.order],
      });
    }
  }

  for (const a of ARTICLES) {
    for (const loc of LOCALES) {
      stmts.push({
        text: `INSERT INTO articles (id,slug,locale,category_id,title,excerpt,content,status,author_name,reviewer_name,reading_time_minutes,medical_disclaimer,published_at) VALUES ($1,$2,$3,(SELECT id FROM article_categories WHERE slug=$4 AND locale=$3 LIMIT 1),$5,$6,$7,'PUBLISHED',$8,$9,$10,$11,NOW()) ON CONFLICT (slug,locale) DO UPDATE SET category_id=(SELECT id FROM article_categories WHERE slug=$4 AND locale=$3 LIMIT 1),title=EXCLUDED.title,excerpt=EXCLUDED.excerpt,content=EXCLUDED.content,status='PUBLISHED',author_name=EXCLUDED.author_name,reviewer_name=EXCLUDED.reviewer_name,reading_time_minutes=EXCLUDED.reading_time_minutes,medical_disclaimer=EXCLUDED.medical_disclaimer,updated_at=NOW()`,
        values: [`art-${a.slug}-${loc}`, a.slug, loc, a.category, a.title[loc], a.excerpt[loc], a.content[loc], AUTHOR[loc], REVIEWER, a.readMin, DISCLAIMER[loc]],
      });
    }
  }

  for (const c of FAQ_CATEGORIES) {
    for (const loc of LOCALES) {
      stmts.push({
        text: `INSERT INTO faq_categories (id,slug,locale,name,sort_order,is_active) VALUES ($1,$2,$3,$4,$5,TRUE) ON CONFLICT (slug,locale) DO UPDATE SET name=EXCLUDED.name,sort_order=EXCLUDED.sort_order,is_active=TRUE,updated_at=NOW()`,
        values: [`fcat-${c.slug}-${loc}`, c.slug, loc, c.name[loc], c.order],
      });
    }
  }

  for (const f of FAQS) {
    for (const loc of LOCALES) {
      stmts.push({
        text: `INSERT INTO faqs (id,locale,category_id,question,short_answer,status,sort_order,published_at) VALUES ($1,$2,(SELECT id FROM faq_categories WHERE slug=$3 AND locale=$2 LIMIT 1),$4,$5,'PUBLISHED',$6,NOW()) ON CONFLICT (id) DO UPDATE SET category_id=(SELECT id FROM faq_categories WHERE slug=$3 AND locale=$2 LIMIT 1),question=EXCLUDED.question,short_answer=EXCLUDED.short_answer,status='PUBLISHED',sort_order=EXCLUDED.sort_order,updated_at=NOW()`,
        values: [`faq-${f.slug}-${loc}`, loc, f.category, f.q[loc], f.a[loc], f.order],
      });
    }
  }

  return stmts;
}
