import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "../../../components/site/site-header";
import { SiteFooter } from "../../../components/site/site-footer";
import { JsonLd, breadcrumbJsonLd } from "../../../components/seo/json-ld";
import type { Locale } from "../../../i18n/routing";
import { buildPageMetadata, localePath } from "../../../lib/seo";
import { fetchFilters, fetchProducts, formatPrice, mediaUrl } from "../../../lib/catalog";
import { allHubs } from "../../../lib/catalog-hubs";
import "./catalog.css";
import "./hub.css";

type PageParams = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "catalog.meta" });
  return buildPageMetadata({ locale: locale as Locale, title: t("title"), description: t("description"), path: "/hearing-aids" });
}

export default async function CatalogPage({ params, searchParams }: PageParams) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(rawLocale);
  const raw = await searchParams;
  const t = await getTranslations({ locale: rawLocale, namespace: "catalog" });

  const query = new URLSearchParams();
  Object.entries(raw).forEach(([k, v]) => {
    if (typeof v === "string" && v) query.set(k, v);
  });

  const [result, filters] = await Promise.all([fetchProducts(locale, query), fetchFilters(locale)]);

  const base = localePath(locale, "/hearing-aids");
  const str = (key: string) => (typeof raw[key] === "string" ? (raw[key] as string) : "");
  const pageHref = (page: number) => {
    const next = new URLSearchParams(query);
    next.set("page", String(page));
    return `${base}?${next.toString()}`;
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Soundz", path: "/" }, { name: t("hero.eyebrow"), path: "/hearing-aids" }])} />
      <SiteHeader />
      <main className="sz-cat">
        <section className="sz-cat__hero">
          <div className="sz-container">
            <p className="sz-cat__eyebrow">{t("hero.eyebrow")}</p>
            <h1 className="sz-cat__title">{t("hero.title")}</h1>
            <p className="sz-cat__lead">{t("hero.subtitle")}</p>
            <nav className="sz-cat__hubnav" aria-label={t("hero.eyebrow")}>
              {allHubs(locale).map((h) => (
                <a key={h.path} href={localePath(locale, h.path)}>{h.title}</a>
              ))}
            </nav>
          </div>
        </section>

        <section className="sz-container sz-cat__layout">
          <aside className="sz-cat__sidebar">
            <form className="sz-cat__filters" method="get">
              <p className="sz-cat__filters-title">{t("filters.title")}</p>
              <label>{t("filters.search")}
                <input name="search" defaultValue={str("search")} placeholder={t("filters.searchPlaceholder")} />
              </label>
              <label>{t("filters.brand")}
                <select name="brand" defaultValue={str("brand")}>
                  <option value="">{t("filters.all")}</option>
                  {filters.brands.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </label>
              <label>{t("filters.formFactor")}
                <select name="formFactor" defaultValue={str("formFactor")}>
                  <option value="">{t("filters.all")}</option>
                  {filters.formFactors.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </label>
              <label>{t("filters.techLevel")}
                <select name="technologyLevel" defaultValue={str("technologyLevel")}>
                  <option value="">{t("filters.all")}</option>
                  {filters.technologyLevels.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </label>
              <div className="sz-cat__price-row">
                <label>{t("filters.minPrice")}<input type="number" name="minPrice" defaultValue={str("minPrice")} /></label>
                <label>{t("filters.maxPrice")}<input type="number" name="maxPrice" defaultValue={str("maxPrice")} /></label>
              </div>
              <label className="sz-cat__check"><input type="checkbox" name="rechargeable" value="true" defaultChecked={raw.rechargeable === "true"} />{t("filters.rechargeable")}</label>
              <label className="sz-cat__check"><input type="checkbox" name="bluetooth" value="true" defaultChecked={raw.bluetooth === "true"} />{t("filters.bluetooth")}</label>
              <label className="sz-cat__check"><input type="checkbox" name="inStock" value="true" defaultChecked={raw.inStock === "true"} />{t("filters.inStock")}</label>
              <label>{t("filters.sort")}
                <select name="sort" defaultValue={str("sort")}>
                  <option value="">{t("filters.sortRecommended")}</option>
                  <option value="price-asc">{t("filters.sortPriceAsc")}</option>
                  <option value="price-desc">{t("filters.sortPriceDesc")}</option>
                  <option value="name">{t("filters.sortName")}</option>
                </select>
              </label>
              <button className="sz-btn sz-btn--primary sz-btn--md" type="submit">{t("filters.apply")}</button>
              <a className="sz-cat__reset" href={base}>{t("filters.reset")}</a>
            </form>
          </aside>

          <div className="sz-cat__results">
            <div className="sz-cat__toolbar">
              <strong>{t("list.count", { total: result.total })}</strong>
              <span>{result.page} / {result.totalPages}</span>
            </div>
            {result.items.length === 0 ? (
              <div className="sz-cat__empty">
                <h2>{t("list.empty")}</h2>
                <p>{t("list.emptyHint")}</p>
              </div>
            ) : (
              <div className="sz-cat__grid">
                {result.items.map((p) => {
                  const priceStr = formatPrice(locale, p.priceFrom);
                  const href = localePath(locale, `/hearing-aids/${p.brandSlug ?? "brand"}/${p.slug}`);
                  return (
                    <article className="sz-cat__card" key={p.id}>
                      <a className="sz-cat__card-media" href={href}>
                        {p.imageUrl ? <img src={mediaUrl(p.imageUrl)} alt={p.name} loading="lazy" /> : <span>Soundz</span>}
                      </a>
                      <div className="sz-cat__card-meta">
                        <span>{p.brand ?? "Soundz"}</span>
                        <b className={p.inStock ? "" : "sz-cat__badge--muted"}>{p.inStock ? t("list.inStock") : t("list.preOrder")}</b>
                      </div>
                      <h2 className="sz-cat__card-title"><a href={href}>{p.name}</a></h2>
                      {p.shortDescription ? <p className="sz-cat__card-desc">{p.shortDescription}</p> : null}
                      <div className="sz-cat__chips">
                        {p.formFactor ? <span>{p.formFactor}</span> : null}
                        {p.technologyLevel ? <span>{p.technologyLevel}</span> : null}
                        {p.rechargeable ? <span>{t("filters.rechargeable")}</span> : null}
                        {p.bluetooth ? <span>Bluetooth</span> : null}
                      </div>
                      <div className="sz-cat__card-foot">
                        <strong>{priceStr ? t("list.priceFrom", { price: priceStr }) : t("list.priceOnConsult")}</strong>
                        <a href={href}>{t("list.details")} →</a>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
            {result.totalPages > 1 ? (
              <nav className="sz-cat__pagination" aria-label={t("hero.eyebrow")}>
                {result.page > 1 ? <a href={pageHref(result.page - 1)}>← {t("list.prev")}</a> : <span />}
                <span>{result.page} / {result.totalPages}</span>
                {result.page < result.totalPages ? <a href={pageHref(result.page + 1)}>{t("list.next")} →</a> : <span />}
              </nav>
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
