import type { Metadata } from "next";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://soundz.uz";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Слуховые аппараты — Soundz",
  description: "Каталог слуховых аппаратов с фильтрами по бренду, форм-фактору, технологии и цене.",
  alternates: {
    canonical: `${SITE_URL}/ru/eshitish-moslamalari`,
    languages: {
      "uz-UZ": `${SITE_URL}/eshitish-moslamalari`,
      "ru-UZ": `${SITE_URL}/ru/eshitish-moslamalari`,
      "x-default": `${SITE_URL}/eshitish-moslamalari`,
    },
  },
};

type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  brand?: string;
  formFactor?: string;
  technologyLevel?: string;
  priceFrom?: number;
  rechargeable: boolean;
  bluetooth: boolean;
  inStock: boolean;
  imageUrl?: string;
};

type Filters = {
  brands: string[];
  formFactors: string[];
  technologyLevels: string[];
  priceRange: { minPrice: number; maxPrice: number };
};

type Result = { items: Product[]; total: number; page: number; limit: number; totalPages: number };

const mediaUrl = (url?: string): string => {
  if (!url) return "";
  return /^https?:\/\//.test(url) ? url : `${API_URL.replace(/\/v1$/, "")}${url}`;
};

export default async function RussianCatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const query = new URLSearchParams({ locale: "ru" });
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string" && value) query.set(key, value);
  }
  if (!query.has("limit")) query.set("limit", "12");

  let result: Result = { items: [], total: 0, page: 1, limit: 12, totalPages: 1 };
  let filters: Filters = { brands: [], formFactors: [], technologyLevels: [], priceRange: { minPrice: 0, maxPrice: 0 } };

  try {
    const [productsResponse, filtersResponse] = await Promise.all([
      fetch(`${API_URL}/catalog/products?${query}`, { cache: "no-store" }),
      fetch(`${API_URL}/catalog/filters?locale=ru`, { cache: "no-store" }),
    ]);
    if (productsResponse.ok) result = await productsResponse.json();
    if (filtersResponse.ok) filters = await filtersResponse.json();
  } catch {
    // Public page remains available while API is restarting.
  }

  const pageHref = (page: number): string => {
    const next = new URLSearchParams(query);
    next.delete("locale");
    next.set("page", String(page));
    return `/ru/eshitish-moslamalari?${next}`;
  };

  return (
    <main>
      <header className="site-header">
        <Link className="logo" href="/ru"><span>S</span>Soundz</Link>
        <nav>
          <Link href="/ru/eshitish-moslamalari">Аппараты</Link>
          <Link href="/ru#services">Услуги</Link>
          <Link href="/ru#booking">Запись</Link>
        </nav>
        <Link className="header-cta" href="/ru#booking">Консультация</Link>
      </header>

      <section className="catalog-hero">
        <p className="eyebrow">СЛУХОВЫЕ АППАРАТЫ</p>
        <h1>Найдите подходящее решение.</h1>
        <p>Фильтруйте модели по образу жизни, уровню технологии и бюджету. Окончательный выбор делается после проверки слуха.</p>
      </section>

      <section className="catalog-layout">
        <aside className="catalog-sidebar">
          <form>
            <label>Поиск<input name="search" defaultValue={typeof raw.search === "string" ? raw.search : ""} placeholder="Модель или бренд" /></label>
            <label>Бренд<select name="brand" defaultValue={typeof raw.brand === "string" ? raw.brand : ""}><option value="">Все</option>{filters.brands.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Форм-фактор<select name="formFactor" defaultValue={typeof raw.formFactor === "string" ? raw.formFactor : ""}><option value="">Все</option>{filters.formFactors.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Уровень технологии<select name="technologyLevel" defaultValue={typeof raw.technologyLevel === "string" ? raw.technologyLevel : ""}><option value="">Все</option>{filters.technologyLevels.map((item) => <option key={item}>{item}</option>)}</select></label>
            <div className="price-row">
              <label>Мин. цена<input type="number" name="minPrice" defaultValue={typeof raw.minPrice === "string" ? raw.minPrice : ""} /></label>
              <label>Макс. цена<input type="number" name="maxPrice" defaultValue={typeof raw.maxPrice === "string" ? raw.maxPrice : ""} /></label>
            </div>
            <label className="check"><input type="checkbox" name="rechargeable" value="true" defaultChecked={raw.rechargeable === "true"} />Перезаряжаемый</label>
            <label className="check"><input type="checkbox" name="bluetooth" value="true" defaultChecked={raw.bluetooth === "true"} />Bluetooth</label>
            <label className="check"><input type="checkbox" name="inStock" value="true" defaultChecked={raw.inStock === "true"} />В наличии</label>
            <label>Сортировка<select name="sort" defaultValue={typeof raw.sort === "string" ? raw.sort : ""}><option value="">Рекомендуемые</option><option value="price-asc">Цена: по возрастанию</option><option value="price-desc">Цена: по убыванию</option><option value="name">По названию</option></select></label>
            <button className="primary">Применить</button>
            <Link className="secondary filter-reset" href="/ru/eshitish-moslamalari">Сбросить</Link>
          </form>
        </aside>

        <div className="catalog-results">
          <div className="catalog-toolbar"><strong>{result.total} товаров</strong><span>Страница {result.page} из {result.totalPages}</span></div>
          <div className="product-grid">
            {result.items.length === 0 ? (
              <div className="empty-state"><h2>Товары не найдены</h2><p>Измените фильтры или запишитесь на консультацию.</p></div>
            ) : result.items.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">{product.imageUrl ? <img src={mediaUrl(product.imageUrl)} alt={product.name} /> : <span>Soundz</span>}</div>
                <div className="product-meta"><span>{product.brand ?? "Слуховой аппарат"}</span>{product.inStock ? <b>В наличии</b> : <b className="muted-badge">Под заказ</b>}</div>
                <h2>{product.name}</h2>
                <p>{product.shortDescription ?? "Современное слуховое решение с индивидуальной настройкой."}</p>
                <div className="feature-chips">{product.formFactor && <span>{product.formFactor}</span>}{product.technologyLevel && <span>{product.technologyLevel}</span>}{product.rechargeable && <span>Аккумулятор</span>}{product.bluetooth && <span>Bluetooth</span>}</div>
                <div className="product-footer"><strong>{product.priceFrom ? `от ${new Intl.NumberFormat("ru-RU").format(product.priceFrom)} сум` : "Цена на консультации"}</strong><Link href={`/ru/eshitish-moslamalari/${product.slug}`}>Подробнее →</Link></div>
              </article>
            ))}
          </div>
          {result.totalPages > 1 && (
            <nav className="pagination" aria-label="Страницы каталога">
              {result.page > 1 && <Link href={pageHref(result.page - 1)}>← Назад</Link>}
              <span>{result.page} / {result.totalPages}</span>
              {result.page < result.totalPages && <Link href={pageHref(result.page + 1)}>Далее →</Link>}
            </nav>
          )}
        </div>
      </section>
    </main>
  );
}
