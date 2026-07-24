import type { Locale } from "../i18n/routing";
import type { Product } from "./catalog";

/**
 * Katalog "hub" (dasturlangan SEO) sahifalari uchun kontent va filtr mantiqi.
 * Har bir hub — mavjud katalog mahsulotlarini oldindan belgilangan mezon bo'yicha
 * ajratib ko'rsatadigan qo'nish (landing) sahifasi: hero + intro + grid + FAQ + CTA.
 *
 * Mahsulotlar API filtrlariga emas, xotiradagi PREDIKATga tayanadi — shu bois
 * bazadagi form_factor qiymatlari qanday yozilganidan (RIC / "Quloq ortida" ...)
 * qat'i nazar sahifa to'g'ri ishlaydi va hech qachon 404 bermaydi.
 */

export type HubFaq = { q: string; a: string };
export type HubHighlight = { title: string; body: string };

export type HubContent = {
  eyebrow: string;
  title: string;
  lead: string;
  intro: string[];
  highlights: HubHighlight[];
  faq: HubFaq[];
};

export type HubDef = {
  /** URL segmenti bo'yicha kalit (masalan "rechargeable", "type/ric"). */
  key: string;
  path: string;
  /** Mahsulotni shu hubga kiritish sharti. */
  match: (p: Product) => boolean;
  sort?: (a: Product, b: Product) => number;
  content: Record<Locale, HubContent>;
};

const tokens = (value?: string | null): string =>
  (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const formHas = (p: Product, needles: string[]): boolean => {
  const hay = `${tokens(p.formFactor)} ${tokens(p.slug)} ${tokens(p.name)}`;
  return needles.some((n) => hay.includes(n));
};

const FORM_SYNONYMS: Record<string, string[]> = {
  ric: ["ric", "rite", "receiver in canal", "receiver"],
  bte: ["bte", "behind the ear", "quloq ort", "zauhom"],
  ite: ["ite", "in the ear", "quloq ich"],
  cic: ["cic", "completely in canal"],
  iic: ["iic", "invisible in canal", "invisible"],
};

/** Aynan bir form-faktor turi uchun hub (RIC/BTE/ITE/CIC/IIC). */
export const FORM_TYPES = ["ric", "bte", "ite", "cic", "iic"] as const;
export type FormType = (typeof FORM_TYPES)[number];

// ---- Kontent ----------------------------------------------------------------

const TYPE_CONTENT: Record<FormType, Record<Locale, HubContent>> = {
  ric: {
    uz: {
      eyebrow: "Moslama turi",
      title: "RIC eshitish moslamalari",
      lead: "Quloq suprasi ortida joylashib, ovoz karnayi quloq kanaliga tushadigan eng ommabop va zamonaviy tur.",
      intro: [
        "RIC (Receiver-in-Canal) — bugungi kunda eng ko'p tanlanadigan format. Asosiy qismi quloq ortida ixcham joylashadi, ovoz karnayi esa yumshoq simchada quloq kanaliga tushiriladi. Shu tufayli moslama deyarli sezilmaydi va ovoz tabiiy eshitiladi.",
        "Ular yengil-o'rta va o'rta-og'ir eshitish pasayishiga mos keladi, quvvatlanadigan (rechargeable) va Bluetooth versiyalarda mavjud.",
      ],
      highlights: [
        { title: "Sezilmas dizayn", body: "Yupqa simcha va kichik korpus tufayli tashqaridan deyarli ko'rinmaydi." },
        { title: "Tabiiy ovoz", body: "Karnay quloq kanalining ichida bo'lgani uchun ovoz to'liqroq va aniqroq." },
        { title: "Keng qamrov", body: "Yengildan og'irgacha eshitish pasayishi uchun modullar mavjud." },
      ],
      faq: [
        { q: "RIC kimlarga mos keladi?", a: "Yengil-o'rtadan og'irgacha eshitish pasayishi bo'lgan ko'pchilikka mos. Aniq tanlovni audiolog tekshiruvdan so'ng aytadi." },
        { q: "RIC va BTE farqi nimada?", a: "BTE'da karnay korpus ichida bo'lib, ovoz naycha orqali uzatiladi; RIC'da karnay bevosita quloq kanalida — shu bois ixchamroq va tabiiyroq eshitiladi." },
      ],
    },
    ru: {
      eyebrow: "Тип устройства",
      title: "Слуховые аппараты RIC",
      lead: "Самый популярный современный тип: корпус за ухом, а ресивер опускается в слуховой канал.",
      intro: [
        "RIC (Receiver-in-Canal) — сегодня самый выбираемый формат. Основной блок компактно располагается за ухом, а динамик на тонком проводке помещается в слуховой канал. Благодаря этому аппарат почти незаметен, а звук — естественный.",
        "Подходит при лёгкой, средней и умеренно-тяжёлой потере слуха, доступен в перезаряжаемых и Bluetooth-версиях.",
      ],
      highlights: [
        { title: "Незаметный дизайн", body: "Тонкий проводок и небольшой корпус почти не видны со стороны." },
        { title: "Естественный звук", body: "Ресивер в канале даёт более полное и чёткое звучание." },
        { title: "Широкий охват", body: "Модули под потерю слуха от лёгкой до тяжёлой." },
      ],
      faq: [
        { q: "Кому подходит RIC?", a: "Большинству с потерей слуха от лёгкой до тяжёлой. Точный выбор аудиолог назовёт после обследования." },
        { q: "Чем RIC отличается от BTE?", a: "В BTE динамик в корпусе, звук идёт по трубке; в RIC динамик прямо в канале — компактнее и естественнее." },
      ],
    },
    en: {
      eyebrow: "Device type",
      title: "RIC hearing aids",
      lead: "The most popular modern style: the body sits behind the ear while the receiver rests in the ear canal.",
      intro: [
        "RIC (Receiver-in-Canal) is today's most chosen format. The main unit sits discreetly behind the ear and the speaker rests in the canal on a thin wire, so the device is nearly invisible and sound stays natural.",
        "It suits mild to moderately-severe hearing loss and comes in rechargeable and Bluetooth versions.",
      ],
      highlights: [
        { title: "Discreet design", body: "The thin wire and small housing are barely visible." },
        { title: "Natural sound", body: "A receiver in the canal delivers fuller, clearer sound." },
        { title: "Wide coverage", body: "Modules for mild through severe hearing loss." },
      ],
      faq: [
        { q: "Who is RIC for?", a: "Most people with mild to severe loss. Your audiologist confirms the exact fit after testing." },
        { q: "RIC vs BTE?", a: "In BTE the speaker is in the body and sound travels through a tube; in RIC the speaker sits in the canal — smaller and more natural." },
      ],
    },
  },
  bte: {
    uz: {
      eyebrow: "Moslama turi",
      title: "BTE — quloq ortidagi moslamalar",
      lead: "Ishonchli, quvvatli va parvarishi oson klassik format — barcha yosh guruhlari uchun.",
      intro: [
        "BTE (Behind-the-Ear) — barcha qismlari quloq ortidagi korpusda joylashgan, ovoz maxsus naycha va quloq qolipi orqali uzatiladi. Bardoshli va quvvatli bo'lgani uchun og'ir darajadagi pasayishga ham mos.",
        "Kattaroq korpus tugmalar bilan boshqarishni va batareya resursini osonlashtiradi — ayniqsa bolalar va keksalar uchun qulay.",
      ],
      highlights: [
        { title: "Quvvatli", body: "Og'ir eshitish pasayishini ham qoplaydigan kuchli modullar." },
        { title: "Bardoshli", body: "Yirikroq korpus namlik va zarbaga chidamliroq." },
        { title: "Oson boshqaruv", body: "Kattaroq tugmalar — keksalar va bolalar uchun qulay." },
      ],
      faq: [
        { q: "BTE kimlar uchun eng yaxshi?", a: "Og'ir eshitish pasayishi bo'lganlar, bolalar va moslamani oson boshqarishni istaganlar uchun." },
        { q: "Quloq qolipi shartmi?", a: "Ha, BTE odatda individual quloq qolipi bilan ishlaydi — bu qulaylik va ovoz sifatini oshiradi." },
      ],
    },
    ru: {
      eyebrow: "Тип устройства",
      title: "Заушные аппараты (BTE)",
      lead: "Надёжный, мощный и простой в уходе классический формат для любого возраста.",
      intro: [
        "BTE (Behind-the-Ear) — все элементы в корпусе за ухом, звук идёт через трубку и ушной вкладыш. Прочный и мощный, подходит даже при тяжёлой потере слуха.",
        "Более крупный корпус упрощает управление кнопками и увеличивает ресурс батареи — удобно детям и пожилым.",
      ],
      highlights: [
        { title: "Мощность", body: "Сильные модули компенсируют даже тяжёлую потерю слуха." },
        { title: "Прочность", body: "Крупный корпус устойчивее к влаге и ударам." },
        { title: "Простое управление", body: "Крупные кнопки удобны пожилым и детям." },
      ],
      faq: [
        { q: "Кому лучше всего подходит BTE?", a: "Людям с тяжёлой потерей слуха, детям и тем, кому важно простое управление." },
        { q: "Нужен ли ушной вкладыш?", a: "Да, BTE обычно работает с индивидуальным вкладышем — это повышает комфорт и качество звука." },
      ],
    },
    en: {
      eyebrow: "Device type",
      title: "Behind-the-ear (BTE) aids",
      lead: "A reliable, powerful and easy-to-maintain classic format for every age.",
      intro: [
        "BTE (Behind-the-Ear) keeps all parts in a housing behind the ear, with sound delivered through a tube and earmould. Sturdy and powerful, it suits even severe hearing loss.",
        "The larger housing makes button control and battery life easier — handy for children and older adults.",
      ],
      highlights: [
        { title: "Powerful", body: "Strong modules compensate even severe hearing loss." },
        { title: "Durable", body: "A larger body resists moisture and knocks better." },
        { title: "Easy control", body: "Larger buttons suit older adults and children." },
      ],
      faq: [
        { q: "Who is BTE best for?", a: "People with severe loss, children, and anyone who wants simple handling." },
        { q: "Is an earmould required?", a: "Yes, BTE usually pairs with a custom earmould — improving comfort and sound quality." },
      ],
    },
  },
  ite: {
    uz: {
      eyebrow: "Moslama turi",
      title: "ITE — quloq ichidagi moslamalar",
      lead: "Quloq suprasi shakliga individual quyilgan, simsiz va ixcham yechim.",
      intro: [
        "ITE (In-the-Ear) — quloq suprasining tashqi qismiga individual tarzda quyiladi. Simsiz, taqish oson va telefon go'shagi bilan qulay.",
        "Yengil-o'rta pasayishga mos; ko'rinishi kichik, ammo tugma va boshqaruvi qulayligicha qoladi.",
      ],
      highlights: [
        { title: "Individual qolip", body: "Aynan sizning quloq shaklingizga quyiladi." },
        { title: "Simsiz", body: "Quloq ortida naycha yoki sim yo'q." },
        { title: "Qulay taqish", body: "Bir bo'lak — kiyish va yechish oson." },
      ],
      faq: [
        { q: "ITE ko'rinadimi?", a: "Quloq suprasida joylashadi, shu bois RIC/BTE'ga qaraganda sezilishi mumkin, lekin ixcham." },
        { q: "Kimlarga mos?", a: "Yengil-o'rta eshitish pasayishi bo'lib, simsiz yechim istaganlarga." },
      ],
    },
    ru: {
      eyebrow: "Тип устройства",
      title: "Внутриушные аппараты (ITE)",
      lead: "Индивидуально отлитое компактное решение без проводов.",
      intro: [
        "ITE (In-the-Ear) отливается индивидуально по внешней части ушной раковины. Без проводов, легко надевается и удобен с телефонной трубкой.",
        "Подходит при лёгкой и средней потере; компактный, но с удобным управлением.",
      ],
      highlights: [
        { title: "Индивидуальный корпус", body: "Отливается точно по форме вашего уха." },
        { title: "Без проводов", body: "Никаких трубок или проводков за ухом." },
        { title: "Удобное ношение", body: "Один элемент — легко надеть и снять." },
      ],
      faq: [
        { q: "Заметен ли ITE?", a: "Располагается в раковине уха, поэтому заметнее RIC/BTE, но остаётся компактным." },
        { q: "Кому подходит?", a: "Тем, у кого лёгкая-средняя потеря и кто хочет решение без проводов." },
      ],
    },
    en: {
      eyebrow: "Device type",
      title: "In-the-ear (ITE) aids",
      lead: "A custom-moulded, wireless and compact solution.",
      intro: [
        "ITE (In-the-Ear) is custom-moulded to the outer bowl of your ear. It's wireless, easy to put on, and comfortable with a phone handset.",
        "It suits mild to moderate loss; compact yet easy to control.",
      ],
      highlights: [
        { title: "Custom shell", body: "Moulded exactly to your ear's shape." },
        { title: "Wireless", body: "No tubes or wires behind the ear." },
        { title: "Easy to wear", body: "A single piece — simple to put in and remove." },
      ],
      faq: [
        { q: "Is ITE visible?", a: "It sits in the ear bowl, so it's more visible than RIC/BTE but still compact." },
        { q: "Who is it for?", a: "People with mild to moderate loss who want a wireless option." },
      ],
    },
  },
  cic: {
    uz: {
      eyebrow: "Moslama turi",
      title: "CIC — kanal ichidagi moslamalar",
      lead: "Quloq kanaliga chuqur joylashadigan, tashqaridan deyarli ko'rinmaydigan tur.",
      intro: [
        "CIC (Completely-in-Canal) quloq kanaliga chuqur o'rnatiladi va tashqaridan deyarli ko'rinmaydi. Maksimal maxfiylik istaganlar uchun ideal.",
        "Yengil-o'rta pasayishga mos. Kichik o'lchami tufayli boshqaruv avtomatlashtirilgan.",
      ],
      highlights: [
        { title: "Maxfiy", body: "Kanal ichida — tashqaridan sezilmaydi." },
        { title: "Tabiiy joylashuv", body: "Quloq suprasi ovozni tabiiy yo'naltiradi." },
        { title: "Avtomatik", body: "Kichik korpus — sozlash avtomatik ishlaydi." },
      ],
      faq: [
        { q: "CIC hammaga mosmi?", a: "Yo'q — quloq kanali o'lchami va pasayish darajasiga bog'liq. Audiolog aniqlaydi." },
        { q: "Batareyasi qancha turadi?", a: "Kichik o'lcham sababli batareya resursi RIC/BTE'ga nisbatan qisqaroq bo'lishi mumkin." },
      ],
    },
    ru: {
      eyebrow: "Тип устройства",
      title: "Внутриканальные аппараты (CIC)",
      lead: "Глубоко в канале, почти незаметны снаружи.",
      intro: [
        "CIC (Completely-in-Canal) устанавливается глубоко в слуховой канал и почти не виден снаружи. Идеален для максимальной незаметности.",
        "Подходит при лёгкой-средней потере. Из-за малого размера управление автоматизировано.",
      ],
      highlights: [
        { title: "Незаметность", body: "Внутри канала — не виден со стороны." },
        { title: "Естественность", body: "Раковина уха естественно направляет звук." },
        { title: "Автоматика", body: "Малый корпус — настройка работает автоматически." },
      ],
      faq: [
        { q: "Подходит ли CIC всем?", a: "Нет — зависит от размера канала и степени потери. Определяет аудиолог." },
        { q: "Сколько держит батарея?", a: "Из-за малого размера ресурс батареи может быть короче, чем у RIC/BTE." },
      ],
    },
    en: {
      eyebrow: "Device type",
      title: "Completely-in-canal (CIC) aids",
      lead: "Sit deep in the canal and are nearly invisible from outside.",
      intro: [
        "CIC (Completely-in-Canal) fits deep in the ear canal and is almost invisible from the outside — ideal for maximum discretion.",
        "It suits mild to moderate loss. Due to the small size, control is automated.",
      ],
      highlights: [
        { title: "Discreet", body: "Inside the canal — unseen from outside." },
        { title: "Natural pickup", body: "The ear bowl directs sound naturally." },
        { title: "Automatic", body: "A small body means automatic tuning." },
      ],
      faq: [
        { q: "Is CIC right for everyone?", a: "No — it depends on canal size and loss degree. Your audiologist decides." },
        { q: "How long does the battery last?", a: "Because of the small size, battery life can be shorter than RIC/BTE." },
      ],
    },
  },
  iic: {
    uz: {
      eyebrow: "Moslama turi",
      title: "IIC — ko'rinmas moslamalar",
      lead: "Eng maxfiy format: kanalga eng chuqur joylashib, umuman ko'rinmaydi.",
      intro: [
        "IIC (Invisible-in-Canal) — bozordagi eng maxfiy format. Kanalga eng chuqur o'rnatiladi va tashqaridan mutlaqo ko'rinmaydi.",
        "Yengil-o'rta pasayishga va tor bo'lmagan quloq kanaliga ega bo'lganlarga mos.",
      ],
      highlights: [
        { title: "To'liq ko'rinmas", body: "Kanalning eng chuqurida — hech kim sezmaydi." },
        { title: "Individual", body: "Faqat sizning quloq anatomiyangizga quyiladi." },
        { title: "Tabiiy ovoz", body: "Chuqur joylashuv tabiiy akustikani saqlaydi." },
      ],
      faq: [
        { q: "IIC kimga mos emas?", a: "Juda tor kanal yoki og'ir pasayish bo'lsa mos kelmasligi mumkin." },
        { q: "IIC va CIC farqi?", a: "IIC yanada chuqurroq va kichikroq — CIC'dan ham ko'rinmasroq." },
      ],
    },
    ru: {
      eyebrow: "Тип устройства",
      title: "Невидимые аппараты (IIC)",
      lead: "Самый незаметный формат: глубже всего в канале, полностью невидим.",
      intro: [
        "IIC (Invisible-in-Canal) — самый незаметный формат на рынке. Устанавливается глубже всего в канал и совершенно не виден снаружи.",
        "Подходит при лёгкой-средней потере и достаточно широком слуховом канале.",
      ],
      highlights: [
        { title: "Полностью невидим", body: "В самой глубине канала — никто не заметит." },
        { title: "Индивидуальный", body: "Отливается только по вашей анатомии уха." },
        { title: "Естественный звук", body: "Глубокая посадка сохраняет естественную акустику." },
      ],
      faq: [
        { q: "Кому IIC не подходит?", a: "При очень узком канале или тяжёлой потере может не подойти." },
        { q: "Отличие IIC от CIC?", a: "IIC ещё глубже и меньше — незаметнее, чем CIC." },
      ],
    },
    en: {
      eyebrow: "Device type",
      title: "Invisible-in-canal (IIC) aids",
      lead: "The most discreet format: seated deepest in the canal, fully invisible.",
      intro: [
        "IIC (Invisible-in-Canal) is the most discreet format on the market. It sits deepest in the canal and is completely invisible from outside.",
        "It suits mild to moderate loss and a canal that isn't too narrow.",
      ],
      highlights: [
        { title: "Fully invisible", body: "Deepest in the canal — nobody notices." },
        { title: "Custom", body: "Moulded only to your ear anatomy." },
        { title: "Natural sound", body: "A deep fit preserves natural acoustics." },
      ],
      faq: [
        { q: "Who is IIC not for?", a: "A very narrow canal or severe loss may not suit it." },
        { q: "IIC vs CIC?", a: "IIC is even deeper and smaller — more discreet than CIC." },
      ],
    },
  },
};

const FEATURE_CONTENT: Record<string, Record<Locale, HubContent>> = {
  rechargeable: {
    uz: {
      eyebrow: "Xususiyat",
      title: "Quvvatlanadigan eshitish moslamalari",
      lead: "Batareya almashtirishni unuting — bir kechada quvvat oling va butun kun eshiting.",
      intro: [
        "Quvvatlanadigan (rechargeable) moslamalar kichik batareyalarni almashtirish zaruratini yo'q qiladi. Kechasi quvvatlash stansiyasiga qo'yasiz, ertalab to'liq zaryad bilan olasiz.",
        "Bu ayniqsa mayda batareyani almashtirish qiyin bo'lgan keksalar va faol hayot kechiruvchilar uchun qulay.",
      ],
      highlights: [
        { title: "Kun bo'yi quvvat", body: "To'liq zaryad odatda 24 soatgacha, oqim uzatishda kamroq." },
        { title: "Qulaylik", body: "Mayda batareya bilan ovora bo'lish yo'q." },
        { title: "Ekologik", body: "Bir martalik batareyalar chiqindisi kamayadi." },
      ],
      faq: [
        { q: "Bir zaryad qancha yetadi?", a: "Modelga qarab 20-30 soat; Bluetooth orqali ovoz uzatilsa resurs kamayadi." },
        { q: "Batareya eskirsa nima bo'ladi?", a: "Li-ion batareya bir necha yildan so'ng servisda almashtiriladi — bu rejali xizmat." },
      ],
    },
    ru: {
      eyebrow: "Особенность",
      title: "Перезаряжаемые слуховые аппараты",
      lead: "Забудьте о замене батареек — заряжайте за ночь и слушайте весь день.",
      intro: [
        "Перезаряжаемые аппараты избавляют от замены крошечных батареек. Ставите на зарядную станцию на ночь — утром получаете полный заряд.",
        "Особенно удобно пожилым, кому тяжело менять мелкие батарейки, и активным людям.",
      ],
      highlights: [
        { title: "Заряд на весь день", body: "Полного заряда обычно хватает до 24 часов, при стриминге меньше." },
        { title: "Удобство", body: "Никакой возни с мелкими батарейками." },
        { title: "Экологично", body: "Меньше отходов от одноразовых батареек." },
      ],
      faq: [
        { q: "На сколько хватает заряда?", a: "В зависимости от модели 20-30 часов; при стриминге по Bluetooth ресурс меньше." },
        { q: "Что если батарея износится?", a: "Li-ion батарея меняется в сервисе через несколько лет — плановое обслуживание." },
      ],
    },
    en: {
      eyebrow: "Feature",
      title: "Rechargeable hearing aids",
      lead: "Forget swapping batteries — charge overnight and hear all day.",
      intro: [
        "Rechargeable aids remove the need to replace tiny batteries. Place them on the charger overnight and pick them up fully charged in the morning.",
        "It's especially handy for older adults who find small batteries fiddly, and for active lifestyles.",
      ],
      highlights: [
        { title: "All-day power", body: "A full charge usually lasts up to 24 hours, less while streaming." },
        { title: "Convenience", body: "No fumbling with tiny batteries." },
        { title: "Eco-friendly", body: "Less disposable-battery waste." },
      ],
      faq: [
        { q: "How long does a charge last?", a: "Depending on the model, 20-30 hours; Bluetooth streaming reduces it." },
        { q: "What if the battery ages?", a: "The Li-ion cell is replaced at service after a few years — planned maintenance." },
      ],
    },
  },
  bluetooth: {
    uz: {
      eyebrow: "Xususiyat",
      title: "Bluetooth eshitish moslamalari",
      lead: "Telefon, televizor va musiqani to'g'ridan-to'g'ri quloqqa oqiming.",
      intro: [
        "Bluetooth moslamalar telefon qo'ng'iroqlari, musiqa va TV ovozini simsiz tarzda bevosita quloqqa uzatadi. Ilova orqali ovoz balandligi va rejimlarni telefondan boshqarasiz.",
        "Bu moslamani nafaqat eshitish yordamchisi, balki shaxsiy audio qurilmaga aylantiradi.",
      ],
      highlights: [
        { title: "To'g'ridan-to'g'ri oqim", body: "Qo'ng'iroq va musiqa to'g'ridan-to'g'ri moslamada." },
        { title: "Ilovadan boshqaruv", body: "Ovoz, rejim va ekvalayzer telefon ilovasida." },
        { title: "TV va aksessuar", body: "Maxsus uzatgichlar bilan TV ovozi ham simsiz." },
      ],
      faq: [
        { q: "Har qanday telefonga ulanadimi?", a: "Aksar zamonaviy iOS va Android telefonlarga; ba'zi funksiyalar modelga bog'liq." },
        { q: "Bluetooth batareyani kamaytiradimi?", a: "Ha, faol oqimda zaryad tezroq tugaydi, lekin kun davomiga yetadi." },
      ],
    },
    ru: {
      eyebrow: "Особенность",
      title: "Слуховые аппараты с Bluetooth",
      lead: "Транслируйте звонки, ТВ и музыку прямо в уши.",
      intro: [
        "Bluetooth-аппараты передают звонки, музыку и звук ТВ по беспроводной связи прямо в уши. Через приложение вы управляете громкостью и режимами со смартфона.",
        "Это превращает аппарат не только в помощник слуха, но и в персональное аудиоустройство.",
      ],
      highlights: [
        { title: "Прямой стриминг", body: "Звонки и музыка сразу в аппарате." },
        { title: "Управление в приложении", body: "Громкость, режимы и эквалайзер в приложении." },
        { title: "ТВ и аксессуары", body: "С передатчиками звук ТВ тоже беспроводной." },
      ],
      faq: [
        { q: "Подключается к любому телефону?", a: "К большинству современных iOS и Android; часть функций зависит от модели." },
        { q: "Bluetooth сажает батарею?", a: "Да, при активном стриминге заряд уходит быстрее, но хватает на день." },
      ],
    },
    en: {
      eyebrow: "Feature",
      title: "Bluetooth hearing aids",
      lead: "Stream calls, TV and music straight to your ears.",
      intro: [
        "Bluetooth aids stream phone calls, music and TV audio wirelessly straight to your ears. Through an app you control volume and programs from your phone.",
        "That turns the aid into not just a hearing helper but a personal audio device.",
      ],
      highlights: [
        { title: "Direct streaming", body: "Calls and music right in the aid." },
        { title: "App control", body: "Volume, programs and equaliser in the app." },
        { title: "TV & accessories", body: "With transmitters, TV audio is wireless too." },
      ],
      faq: [
        { q: "Does it connect to any phone?", a: "To most modern iOS and Android phones; some features depend on the model." },
        { q: "Does Bluetooth drain the battery?", a: "Yes, active streaming uses more, but it still lasts the day." },
      ],
    },
  },
  invisible: {
    uz: {
      eyebrow: "Format",
      title: "Ko'rinmas eshitish moslamalari",
      lead: "Maxfiylikni birinchi o'ringa qo'yadiganlar uchun eng ixcham CIC va IIC yechimlar.",
      intro: [
        "Ko'rinmas format — quloq kanaliga chuqur joylashadigan CIC va IIC moslamalar. Tashqaridan deyarli yoki umuman sezilmaydi.",
        "Yengil-o'rta eshitish pasayishiga va mos keladigan quloq kanaliga ega bo'lganlar uchun ideal maxfiy yechim.",
      ],
      highlights: [
        { title: "Maksimal maxfiylik", body: "Kanal ichida — atrofdagilar sezmaydi." },
        { title: "Individual quyilgan", body: "Aynan sizning quloq shaklingizga mos." },
        { title: "Tabiiy akustika", body: "Chuqur joylashuv tovushni tabiiy saqlaydi." },
      ],
      faq: [
        { q: "Ko'rinmas moslama hammaga mosmi?", a: "Yo'q — quloq kanali o'lchami va pasayish darajasi hal qiluvchi. Audiolog tekshiradi." },
        { q: "Ovoz sifati past bo'ladimi?", a: "Zamonaviy modellarda emas; lekin juda og'ir pasayishga quvvati yetmasligi mumkin." },
      ],
    },
    ru: {
      eyebrow: "Формат",
      title: "Невидимые слуховые аппараты",
      lead: "Самые компактные CIC и IIC для тех, кому важна незаметность.",
      intro: [
        "Невидимый формат — это CIC и IIC, которые устанавливаются глубоко в канал. Снаружи почти или совсем не видны.",
        "Идеальное скрытое решение при лёгкой-средней потере и подходящем слуховом канале.",
      ],
      highlights: [
        { title: "Максимальная незаметность", body: "Внутри канала — окружающие не замечают." },
        { title: "Индивидуальная отливка", body: "Точно по форме вашего уха." },
        { title: "Естественная акустика", body: "Глубокая посадка сохраняет звук естественным." },
      ],
      faq: [
        { q: "Невидимый аппарат подходит всем?", a: "Нет — решают размер канала и степень потери. Проверяет аудиолог." },
        { q: "Хуже ли качество звука?", a: "У современных моделей нет; но при очень тяжёлой потере мощности может не хватить." },
      ],
    },
    en: {
      eyebrow: "Format",
      title: "Invisible hearing aids",
      lead: "The most compact CIC and IIC options for those who value discretion.",
      intro: [
        "The invisible format means CIC and IIC devices that sit deep in the canal. From outside they're barely or not at all visible.",
        "An ideal discreet solution for mild to moderate loss and a suitable ear canal.",
      ],
      highlights: [
        { title: "Maximum discretion", body: "Inside the canal — those around you won't notice." },
        { title: "Custom-moulded", body: "Made exactly to your ear's shape." },
        { title: "Natural acoustics", body: "A deep fit keeps sound natural." },
      ],
      faq: [
        { q: "Is an invisible aid right for everyone?", a: "No — canal size and loss degree decide. An audiologist checks." },
        { q: "Is sound quality worse?", a: "Not on modern models; but very severe loss may exceed its power." },
      ],
    },
  },
  "for-children": {
    uz: {
      eyebrow: "Auditoriya",
      title: "Bolalar uchun eshitish moslamalari",
      lead: "Bardoshli, xavfsiz va o'sib borayotgan quloqqa moslashadigan yechimlar.",
      intro: [
        "Bolalar uchun moslamalar bardoshlilik, xavfsizlik va o'sib borayotgan quloqqa moslashuvchanlikni birinchi o'ringa qo'yadi. Ular yorqin ranglar, mustahkam korpus va ota-ona nazorati imkoniyatlari bilan keladi.",
        "Bola nutqni o'z vaqtida o'rganishi uchun erta va to'g'ri protezlash juda muhim — buni bolalar audiologi bilan rejalashtiramiz.",
      ],
      highlights: [
        { title: "Bardoshli dizayn", body: "Namlik va zarbaga chidamli, faol bola uchun." },
        { title: "Xavfsizlik", body: "Batareya bo'limi qulfi va yo'qotishga qarshi funksiyalar." },
        { title: "O'sishga moslashuv", body: "Quloq qolipi bola o'sgani sayin yangilanadi." },
      ],
      faq: [
        { q: "Necha yoshdan protezlash mumkin?", a: "Zarur bo'lsa chaqaloqlik davridan — erta protezlash nutq rivojiga muhim." },
        { q: "Maktabga mos rejim bormi?", a: "Ha, ba'zi modellarda sinf va shovqinli muhit uchun maxsus rejimlar mavjud." },
      ],
    },
    ru: {
      eyebrow: "Аудитория",
      title: "Слуховые аппараты для детей",
      lead: "Прочные, безопасные и подстраивающиеся под растущее ухо решения.",
      intro: [
        "Детские аппараты ставят во главу угла прочность, безопасность и адаптацию к растущему уху. Они бывают ярких цветов, с крепким корпусом и родительским контролем.",
        "Раннее и правильное протезирование критично для своевременного развития речи — планируем его с детским аудиологом.",
      ],
      highlights: [
        { title: "Прочный дизайн", body: "Устойчив к влаге и ударам для активного ребёнка." },
        { title: "Безопасность", body: "Замок отсека батареи и защита от потери." },
        { title: "Рост вместе с ребёнком", body: "Ушной вкладыш обновляется по мере роста." },
      ],
      faq: [
        { q: "С какого возраста можно протезировать?", a: "При необходимости с младенчества — раннее протезирование важно для речи." },
        { q: "Есть ли режим для школы?", a: "Да, у части моделей есть режимы для класса и шумной среды." },
      ],
    },
    en: {
      eyebrow: "Audience",
      title: "Hearing aids for children",
      lead: "Durable, safe solutions that adapt to a growing ear.",
      intro: [
        "Children's aids prioritise durability, safety and adapting to a growing ear. They come in bright colours, with sturdy housings and parental controls.",
        "Early, correct fitting is critical for timely speech development — we plan it with a paediatric audiologist.",
      ],
      highlights: [
        { title: "Durable design", body: "Resists moisture and knocks for an active child." },
        { title: "Safety", body: "Battery-compartment lock and loss protection." },
        { title: "Grows with the child", body: "The earmould is renewed as the child grows." },
      ],
      faq: [
        { q: "From what age can fitting start?", a: "From infancy if needed — early fitting matters for speech." },
        { q: "Is there a school mode?", a: "Yes, some models have classroom and noisy-environment programs." },
      ],
    },
  },
};

// ---- Predikatlar ------------------------------------------------------------

FEATURE_CONTENT["prices"] = {
  uz: {
    eyebrow: "Narxlar",
    title: "Eshitish moslamalari narxlari",
    lead: "Byudjetga qarab modellarni solishtiring — arzon bazaviydan yuqori darajali premiumgacha.",
    intro: [
      "Eshitish moslamasi narxi texnologiya darajasi, kanal soni, quvvatlanish va Bluetooth kabi imkoniyatlarga bog'liq. Quyida modellar narxi bo'yicha o'sish tartibida joylashtirilgan.",
      "Yakuniy narx faqat audiolog tekshiruvidan so'ng — sizga aynan qaysi daraja kerakligiga qarab aniqlanadi. Ko'pincha bo'lib to'lash imkoni ham mavjud.",
    ],
    highlights: [
      { title: "Bazaviy daraja", body: "Kundalik, sokin muhitga mo'ljallangan hamyonbop modellar." },
      { title: "O'rta daraja", body: "Shovqinli joylar va faol hayot uchun optimal narx/sifat." },
      { title: "Premium daraja", body: "Eng murakkab muhitlar uchun ilg'or ovoz qayta ishlash." },
    ],
    faq: [
      { q: "Narx nimaga bog'liq?", a: "Texnologiya darajasi, kanallar soni, quvvatlanish, Bluetooth va qo'shimcha funksiyalarga." },
      { q: "Bo'lib to'lash bormi?", a: "Ko'p hollarda ha — aniq shartlarni filialdagi mutaxassis bilan muhokama qiling." },
    ],
  },
  ru: {
    eyebrow: "Цены",
    title: "Цены на слуховые аппараты",
    lead: "Сравните модели по бюджету — от доступных базовых до премиальных.",
    intro: [
      "Цена аппарата зависит от уровня технологии, числа каналов, перезарядки и Bluetooth. Ниже модели отсортированы по возрастанию цены.",
      "Итоговая цена определяется только после обследования аудиолога — по тому, какой уровень нужен именно вам. Часто доступна и рассрочка.",
    ],
    highlights: [
      { title: "Базовый уровень", body: "Доступные модели для повседневной тихой обстановки." },
      { title: "Средний уровень", body: "Оптимум цена/качество для шума и активной жизни." },
      { title: "Премиум уровень", body: "Продвинутая обработка звука для сложных сред." },
    ],
    faq: [
      { q: "От чего зависит цена?", a: "От уровня технологии, числа каналов, перезарядки, Bluetooth и доп. функций." },
      { q: "Есть ли рассрочка?", a: "Часто да — точные условия обсудите со специалистом в филиале." },
    ],
  },
  en: {
    eyebrow: "Prices",
    title: "Hearing aid prices",
    lead: "Compare models by budget — from affordable entry level to premium.",
    intro: [
      "A hearing aid's price depends on technology level, number of channels, recharging and Bluetooth. Below, models are sorted by ascending price.",
      "The final price is set only after an audiologist assessment — based on the level you actually need. Instalments are often available too.",
    ],
    highlights: [
      { title: "Entry level", body: "Affordable models for everyday, quiet settings." },
      { title: "Mid level", body: "Best value for noise and an active life." },
      { title: "Premium level", body: "Advanced sound processing for complex environments." },
    ],
    faq: [
      { q: "What determines the price?", a: "Technology level, number of channels, recharging, Bluetooth and extra features." },
      { q: "Are instalments available?", a: "Often yes — discuss exact terms with a specialist at a branch." },
    ],
  },
};

const PREDICATES: Record<string, (p: Product) => boolean> = {
  rechargeable: (p) => p.rechargeable === true,
  bluetooth: (p) => p.bluetooth === true,
  invisible: (p) => formHas(p, [...FORM_SYNONYMS.cic, ...FORM_SYNONYMS.iic]),
  "for-children": (p) =>
    /bola|child|дет|kids|pediatr|pediatric/i.test(`${p.audience ?? ""} ${p.name} ${p.shortDescription ?? ""}`),
  prices: () => true,
};

/** Narxlar hubi uchun: narx o'sish tartibida (narxsizlar oxirida). */
export const priceAscSort = (a: Product, b: Product): number =>
  (a.priceFrom ?? Number.MAX_SAFE_INTEGER) - (b.priceFrom ?? Number.MAX_SAFE_INTEGER);

// ---- Public API -------------------------------------------------------------

export const FEATURE_HUBS = ["rechargeable", "bluetooth", "invisible", "for-children", "prices"] as const;
export type FeatureHub = (typeof FEATURE_HUBS)[number];

export function getTypeHub(type: FormType, locale: Locale): { content: HubContent; match: (p: Product) => boolean } | null {
  const content = TYPE_CONTENT[type]?.[locale];
  if (!content) return null;
  return { content, match: (p) => formHas(p, FORM_SYNONYMS[type]) };
}

export function getFeatureHub(
  hub: FeatureHub,
  locale: Locale,
): { content: HubContent; match: (p: Product) => boolean } | null {
  const content = FEATURE_CONTENT[hub]?.[locale];
  if (!content) return null;
  return { content, match: PREDICATES[hub] };
}

/** Barcha hublar (type + feature) — internal linking va katalog navigatsiyasi uchun. */
export function allHubs(locale: Locale): Array<{ path: string; title: string; eyebrow: string }> {
  const items: Array<{ path: string; title: string; eyebrow: string }> = [];
  for (const t of FORM_TYPES)
    items.push({ path: `/hearing-aids/type/${t}`, title: TYPE_CONTENT[t][locale].title, eyebrow: TYPE_CONTENT[t][locale].eyebrow });
  for (const f of FEATURE_HUBS)
    items.push({ path: `/hearing-aids/${f}`, title: FEATURE_CONTENT[f][locale].title, eyebrow: FEATURE_CONTENT[f][locale].eyebrow });
  return items;
}

/** Boshqa hublarga o'tish uchun tavsiya kartalari (joriy hubdan tashqari). */
export function relatedHubs(locale: Locale, currentPath: string): Array<{ path: string; title: string }> {
  return allHubs(locale)
    .filter((i) => i.path !== currentPath)
    .slice(0, 6)
    .map(({ path, title }) => ({ path, title }));
}
