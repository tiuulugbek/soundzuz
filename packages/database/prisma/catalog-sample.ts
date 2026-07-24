/**
 * Katalog namuna ma'lumoti (Bosqich 2 demo) — 3 brend + asosiy modellar, uz/ru/en.
 * Narxlar ataylab bo'sh (konsultatsiyada aniqlanadi). Idempotent: qayta seed'da yangilanadi.
 * seed.ts SEED_CATALOG=1 bilan chaqiradi. Asoschi keyin admin/importda haqiqiy ma'lumot bilan almashtiradi.
 */

type L = { uz: string; ru: string; en: string };
const LOCALES = ["uz", "ru", "en"] as const;

type BrandDef = { slug: string; name: string; order: number; origin: L; tagline: L; desc: L };
type SpecDef = { label: L; value: string | L };
type ProductDef = {
  slug: string; brand: string; brandName: string; formFactor: string; tech: string;
  rechargeable: boolean; bluetooth: boolean; featured: boolean;
  name: string; audience: L; short: L; desc: L; highlight?: SpecDef;
};

const BRANDS: BrandDef[] = [
  {
    slug: "oticon", name: "Oticon", order: 1,
    origin: { uz: "Daniya", ru: "Дания", en: "Denmark" },
    tagline: { uz: "Miya uchun eshitish", ru: "Слух для мозга", en: "BrainHearing" },
    desc: {
      uz: "Daniyaning yetakchi brendi. BrainHearing yondashuvi bilan miyaga tabiiy, to‘liq tovush manzarasini yetkazadi.",
      ru: "Ведущий датский бренд. Подход BrainHearing передаёт мозгу естественную, полную звуковую картину.",
      en: "A leading Danish brand. Its BrainHearing approach delivers a natural, full sound scene to the brain.",
    },
  },
  {
    slug: "resound", name: "ReSound", order: 2,
    origin: { uz: "Daniya", ru: "Дания", en: "Denmark" },
    tagline: { uz: "Tabiiy eshitish", ru: "Органичный слух", en: "Organic Hearing" },
    desc: {
      uz: "Daniya brendi. Chuqur neyron tarmoq va Auracast bilan aniq, tabiiy tovush va zamonaviy ulanish.",
      ru: "Датский бренд. Глубокая нейросеть и Auracast обеспечивают чистый, естественный звук и современное подключение.",
      en: "A Danish brand. A deep neural network and Auracast bring clear, natural sound and modern connectivity.",
    },
  },
  {
    slug: "signia", name: "Signia", order: 3,
    origin: { uz: "Germaniya", ru: "Германия", en: "Germany" },
    tagline: { uz: "Ajoyib bo‘ling", ru: "Будьте великолепны", en: "Be Brilliant" },
    desc: {
      uz: "Germaniya brendi. Integrated Xperience platformasi bilan suhbatni real vaqtda ajratib, nafis dizaynni birlashtiradi.",
      ru: "Немецкий бренд. Платформа Integrated Xperience выделяет речь в реальном времени и сочетает это с изящным дизайном.",
      en: "A German brand. Its Integrated Xperience platform isolates conversation in real time, paired with elegant design.",
    },
  },
];

const yes: L = { uz: "Ha", ru: "Да", en: "Yes" };
const no: L = { uz: "Yo‘q", ru: "Нет", en: "No" };
const recharge: L = { uz: "Li-ion, qayta zaryadlanuvchi", ru: "Li-ion, перезаряжаемый", en: "Li-ion, rechargeable" };
const disposable: L = { uz: "Almashtiriladigan batareya", ru: "Сменная батарея", en: "Disposable battery" };
const LBL = {
  form: { uz: "Forma-faktor", ru: "Форм-фактор", en: "Form factor" } as L,
  tech: { uz: "Texnologiya darajasi", ru: "Уровень технологии", en: "Technology level" } as L,
  power: { uz: "Quvvat manbai", ru: "Питание", en: "Power" } as L,
  bt: { uz: "Bluetooth", ru: "Bluetooth", en: "Bluetooth" } as L,
};

const PRODUCTS: ProductDef[] = [
  {
    slug: "oticon-intent", brand: "oticon", brandName: "Oticon", formFactor: "RIC (miniRITE)", tech: "Premium",
    rechargeable: true, bluetooth: true, featured: true, name: "Oticon Intent",
    audience: { uz: "Faol turmush, o‘rta–og‘ir eshitish pasayishi", ru: "Активный образ жизни, средняя–тяжёлая потеря слуха", en: "Active lifestyle, moderate–severe hearing loss" },
    short: { uz: "4D sensorli flagman — niyatingizni tushunadi.", ru: "Флагман с 4D-сенсором — понимает ваши намерения.", en: "Flagship with 4D sensor — understands your intent." },
    desc: {
      uz: "Oticon eng ilg‘or apparati. 4D sensor texnologiyasi bosh harakati va suhbatga qarab tovushni real vaqtda moslaydi.",
      ru: "Самый передовой аппарат Oticon. Технология 4D-сенсора адаптирует звук в реальном времени по движению головы и разговору.",
      en: "Oticon's most advanced device. 4D sensor technology adapts sound in real time to head movement and conversation.",
    },
    highlight: { label: { uz: "Xususiyat", ru: "Особенность", en: "Highlight" }, value: { uz: "4D sensor, Deep Neural Network", ru: "4D-сенсор, Deep Neural Network", en: "4D sensor, Deep Neural Network" } },
  },
  {
    slug: "oticon-own", brand: "oticon", brandName: "Oticon", formFactor: "ITE / CIC (individual)", tech: "Premium",
    rechargeable: false, bluetooth: true, featured: false, name: "Oticon Own",
    audience: { uz: "Ko‘rinmas yechim izlaydiganlar", ru: "Кому нужно незаметное решение", en: "Those seeking an invisible solution" },
    short: { uz: "Quloq ichida — individual quyiladigan, ko‘rinmas.", ru: "Внутриушной — индивидуальный, незаметный.", en: "In-the-ear — custom-made and discreet." },
    desc: {
      uz: "Quloqqa individual quyiladigan apparat. IIC va CIC variantlari deyarli ko‘rinmaydi, tabiiy tovush beradi.",
      ru: "Индивидуально изготавливаемый внутриушной аппарат. Варианты IIC и CIC практически незаметны и дают естественный звук.",
      en: "A custom-fit in-ear device. IIC and CIC styles are nearly invisible while delivering natural sound.",
    },
  },
  {
    slug: "oticon-xceed", brand: "oticon", brandName: "Oticon", formFactor: "BTE (Super Power)", tech: "Power",
    rechargeable: true, bluetooth: true, featured: false, name: "Oticon Xceed",
    audience: { uz: "Og‘ir–chuqur eshitish pasayishi", ru: "Тяжёлая–глубокая потеря слуха", en: "Severe–profound hearing loss" },
    short: { uz: "Eng kuchli super-power apparat.", ru: "Самый мощный супер-мощный аппарат.", en: "The most powerful super-power device." },
    desc: {
      uz: "Og‘ir va chuqur eshitish pasayishi uchun. Yuqori kuchaytirish va aniqlik bilan nutqni tushunishni ta’minlaydi.",
      ru: "Для тяжёлой и глубокой потери слуха. Высокое усиление и чёткость обеспечивают разборчивость речи.",
      en: "For severe and profound hearing loss. High amplification and clarity ensure speech understanding.",
    },
  },
  {
    slug: "resound-vivia", brand: "resound", brandName: "ReSound", formFactor: "RIC (microRIE)", tech: "Premium",
    rechargeable: true, bluetooth: true, featured: true, name: "ReSound Vivia",
    audience: { uz: "Aniq nutq izlaydigan faol foydalanuvchilar", ru: "Активные пользователи, ищущие чёткую речь", en: "Active users seeking clear speech" },
    short: { uz: "Ikki chipli flagman — chuqur neyron tarmoq bilan.", ru: "Двухчиповый флагман — с глубокой нейросетью.", en: "Dual-chip flagship — with a deep neural network." },
    desc: {
      uz: "ReSound eng yangi flagmani. Ikki chipli arxitektura va sun’iy intellekt shovqinda ham nutqni ajratib beradi.",
      ru: "Новейший флагман ReSound. Двухчиповая архитектура и ИИ выделяют речь даже в шуме.",
      en: "ReSound's newest flagship. A dual-chip architecture and AI isolate speech even in noise.",
    },
    highlight: { label: { uz: "Xususiyat", ru: "Особенность", en: "Highlight" }, value: "Deep Neural Network, Auracast" },
  },
  {
    slug: "resound-nexia", brand: "resound", brandName: "ReSound", formFactor: "RIC (microRIE)", tech: "Premium",
    rechargeable: true, bluetooth: true, featured: false, name: "ReSound Nexia",
    audience: { uz: "Zamonaviy ulanishni qadrlaydiganlar", ru: "Кто ценит современное подключение", en: "Those who value modern connectivity" },
    short: { uz: "Auracast’ni birinchi bo‘lib qo‘llagan apparat.", ru: "Первый аппарат с поддержкой Auracast.", en: "The first hearing aid to deliver Auracast." },
    desc: {
      uz: "Auracast broadcast texnologiyasini birinchi bo‘lib taqdim etgan apparat. Ixcham korpus va tabiiy tovush.",
      ru: "Первый аппарат с технологией вещания Auracast. Компактный корпус и естественный звук.",
      en: "The first device to deliver Auracast broadcast technology. Compact housing and natural sound.",
    },
  },
  {
    slug: "resound-enzo-ia", brand: "resound", brandName: "ReSound", formFactor: "BTE (Super Power)", tech: "Power",
    rechargeable: true, bluetooth: true, featured: false, name: "ReSound Enzo IA",
    audience: { uz: "Og‘ir–chuqur eshitish pasayishi", ru: "Тяжёлая–глубокая потеря слуха", en: "Severe–profound hearing loss" },
    short: { uz: "Bozordagi eng kichik quvvatlanuvchi super-power.", ru: "Самый маленький перезаряжаемый супер-мощный аппарат.", en: "The smallest rechargeable super-power aid." },
    desc: {
      uz: "Chuqur eshitish pasayishi uchun quvvatlanuvchi super-power apparat — kichik korpusda yuqori kuch.",
      ru: "Перезаряжаемый супер-мощный аппарат для глубокой потери слуха — высокая мощность в малом корпусе.",
      en: "A rechargeable super-power aid for profound hearing loss — high power in a small housing.",
    },
  },
  {
    slug: "signia-pure-ix", brand: "signia", brandName: "Signia", formFactor: "RIC (Pure Charge&Go)", tech: "Premium",
    rechargeable: true, bluetooth: true, featured: true, name: "Signia Pure Charge&Go IX",
    audience: { uz: "Ko‘p suhbatli muhitlar", ru: "Среда с большим количеством разговоров", en: "Multi-conversation environments" },
    short: { uz: "Integrated Xperience flagmani — suhbatni real vaqtda kuchaytiradi.", ru: "Флагман Integrated Xperience — усиливает речь в реальном времени.", en: "Integrated Xperience flagship — enhances conversation in real time." },
    desc: {
      uz: "Signia flagmani. Integrated Xperience platformasi bir nechta suhbatdoshni ajratib, real vaqtda kuchaytiradi.",
      ru: "Флагман Signia. Платформа Integrated Xperience выделяет нескольких собеседников и усиливает их в реальном времени.",
      en: "Signia's flagship. The Integrated Xperience platform isolates multiple speakers and enhances them in real time.",
    },
    highlight: { label: { uz: "Xususiyat", ru: "Особенность", en: "Highlight" }, value: "Integrated Xperience (IX)" },
  },
  {
    slug: "signia-styletto-ix", brand: "signia", brandName: "Signia", formFactor: "Slim-RIC", tech: "Premium",
    rechargeable: true, bluetooth: true, featured: false, name: "Signia Styletto IX",
    audience: { uz: "Dizaynni qadrlaydiganlar", ru: "Кто ценит дизайн", en: "Those who value design" },
    short: { uz: "Bozordagi eng nozik slim-RIC.", ru: "Самый тонкий slim-RIC на рынке.", en: "The thinnest Slim-RIC on the market." },
    desc: {
      uz: "Nafis, qalamsimon dizayn. Zamonaviy ko‘rinish va premium tovushni birlashtiradi, quvvatlash keysi bilan.",
      ru: "Изящный дизайн в форме ручки. Сочетает современный вид и премиальный звук, с зарядным футляром.",
      en: "An elegant pen-like design. Combines a modern look with premium sound, plus a charging case.",
    },
  },
  {
    slug: "signia-silk-ix", brand: "signia", brandName: "Signia", formFactor: "CIC (instant-fit)", tech: "Premium",
    rechargeable: true, bluetooth: true, featured: false, name: "Signia Silk Charge&Go IX",
    audience: { uz: "Darhol tayyor, ko‘rinmas yechim", ru: "Готовое сразу, незаметное решение", en: "Ready-to-wear, discreet solution" },
    short: { uz: "Yumshoq silikon uchli, deyarli ko‘rinmas.", ru: "С мягкими силиконовыми вкладышами, почти незаметный.", en: "Soft silicone tips, nearly invisible." },
    desc: {
      uz: "Darhol quloqqa mos keladigan, ko‘rinmas CIC apparat. Yumshoq silikon uch va quvvatlanish qulayligi.",
      ru: "Незаметный аппарат CIC, подходящий сразу. Мягкие силиконовые вкладыши и удобная зарядка.",
      en: "An invisible CIC device that fits instantly. Soft silicone tips and convenient charging.",
    },
  },
];

export function catalogStatements(): { text: string; values: unknown[] }[] {
  const stmts: { text: string; values: unknown[] }[] = [];

  for (const b of BRANDS) {
    for (const loc of LOCALES) {
      stmts.push({
        text:
          `INSERT INTO brands (id,slug,locale,name,tagline,description,origin_country,sort_order,is_active,status) ` +
          `VALUES ($1,$2,$3,$4,$5,$6,$7,$8,TRUE,'PUBLISHED') ` +
          `ON CONFLICT (slug,locale) DO UPDATE SET name=EXCLUDED.name,tagline=EXCLUDED.tagline,description=EXCLUDED.description,origin_country=EXCLUDED.origin_country,sort_order=EXCLUDED.sort_order,is_active=TRUE,status='PUBLISHED',updated_at=NOW()`,
        values: [`${b.slug}-${loc}`, b.slug, loc, b.name, b.tagline[loc], b.desc[loc], b.origin[loc], b.order],
      });
    }
  }

  for (const p of PRODUCTS) {
    for (const loc of LOCALES) {
      const id = `${p.slug}-${loc}`;
      stmts.push({
        text:
          `INSERT INTO products (id,slug,locale,name,short_description,description,brand,brand_slug,form_factor,technology_level,audience,rechargeable,bluetooth,in_stock,is_featured,status) ` +
          `VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,TRUE,$14,'PUBLISHED') ` +
          `ON CONFLICT (slug,locale) DO UPDATE SET name=EXCLUDED.name,short_description=EXCLUDED.short_description,description=EXCLUDED.description,brand=EXCLUDED.brand,brand_slug=EXCLUDED.brand_slug,form_factor=EXCLUDED.form_factor,technology_level=EXCLUDED.technology_level,audience=EXCLUDED.audience,rechargeable=EXCLUDED.rechargeable,bluetooth=EXCLUDED.bluetooth,is_featured=EXCLUDED.is_featured,status='PUBLISHED',updated_at=NOW()`,
        values: [id, p.slug, loc, p.name, p.short[loc], p.desc[loc], p.brandName, p.brand, p.formFactor, p.tech, p.audience[loc], p.rechargeable, p.bluetooth, p.featured],
      });

      stmts.push({ text: `DELETE FROM product_specs WHERE product_id=$1`, values: [id] });
      const specs: SpecDef[] = [
        { label: LBL.form, value: p.formFactor },
        { label: LBL.tech, value: p.tech },
        { label: LBL.power, value: p.rechargeable ? recharge : disposable },
        { label: LBL.bt, value: p.bluetooth ? yes : no },
      ];
      if (p.highlight) specs.push(p.highlight);
      specs.forEach((s, i) => {
        const value = typeof s.value === "string" ? s.value : s.value[loc];
        stmts.push({
          text: `INSERT INTO product_specs (id,product_id,label,value,sort_order) VALUES ($1,$2,$3,$4,$5)`,
          values: [`${id}-spec-${i}`, id, s.label[loc], value, i],
        });
      });
    }
  }

  // Filtr dropdownlari uchun taksonomiya (filters() catalog_taxonomies'dan o'qiydi).
  const distinct = (arr: string[]) => Array.from(new Set(arr));
  const taxGroups: { type: string; values: string[] }[] = [
    { type: "brand", values: distinct(PRODUCTS.map((p) => p.brandName)) },
    { type: "form_factor", values: distinct(PRODUCTS.map((p) => p.formFactor)) },
    { type: "technology_level", values: distinct(PRODUCTS.map((p) => p.tech)) },
  ];
  for (const group of taxGroups) {
    group.values.forEach((value, i) => {
      stmts.push({
        text: `INSERT INTO catalog_taxonomies (id,type,value,label,sort_order,is_active) VALUES ($1,$2,$3,$4,$5,TRUE) ON CONFLICT (type,value) DO UPDATE SET label=EXCLUDED.label,is_active=TRUE,updated_at=NOW()`,
        values: [`tax-${group.type}-${i}`, group.type, value, value, i],
      });
    });
  }

  return stmts;
}
