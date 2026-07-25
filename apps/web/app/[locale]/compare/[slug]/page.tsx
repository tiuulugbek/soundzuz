import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "../../../../components/site/site-header";
import { SiteFooter } from "../../../../components/site/site-footer";
import { JsonLd, breadcrumbJsonLd } from "../../../../components/seo/json-ld";
import type { Locale } from "../../../../i18n/routing";
import { buildPageMetadata, localePath } from "../../../../lib/seo";
import { mediaUrl } from "../../../../lib/catalog";
import { parseCompareSlug, fetchCompareProducts, buildCompareRows } from "../../../../lib/compare";
import "./compare.css";

type PageParams = { params: Promise<{ locale: string; slug: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "compare" });
  const products = await fetchCompareProducts(locale as Locale, parseCompareSlug(slug));
  if (products.length < 2) {
    return buildPageMetadata({ locale: locale as Locale, title: t("meta.fallbackTitle"), description: t("meta.fallbackDesc"), path: `/compare/${slug}` });
  }
  const names = products.map((p) => p.name).join(" vs ");
  return buildPageMetadata({
    locale: locale as Locale,
    title: t("meta.title", { names }),
    description: t("meta.description", { names }),
    path: `/compare/${slug}`,
  });
}

export default async function ComparePage({ params }: PageParams) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "compare" });
  const tc = await getTranslations({ locale, namespace: "catalog" });

  const slugs = parseCompareSlug(slug);
  if (slugs.length < 2) notFound();

  const products = await fetchCompareProducts(locale, slugs);

  // 2 tadan kam haqiqiy mahsulot topilsa — foydali bo'sh holat (404 emas, SEO uchun sahifa qoladi).
  if (products.length < 2) {
    return (
      <>
        <SiteHeader />
        <main className="sz-cmp">
          <section className="sz-cmp__hero">
            <div className="sz-container">
              <p className="sz-cmp__eyebrow">{t("hero.eyebrow")}</p>
              <h1 className="sz-cmp__title">{t("empty.title")}</h1>
              <p className="sz-cmp__lead">{t("empty.lead")}</p>
              <a className="sz-btn sz-btn--primary sz-btn--lg" href={localePath(locale, "/hearing-aids")}>
                <span className="sz-btn__label">{t("empty.cta")}</span>
              </a>
            </div>
          </section>
        </main>
        <SiteFooter />
      </>
    );
  }

  const rows = buildCompareRows(locale, products, {
    brand: t("rows.brand"),
    price: t("rows.price"),
    availability: t("rows.availability"),
    inStock: tc("list.inStock"),
    preOrder: tc("list.preOrder"),
    consult: tc("list.priceOnConsult"),
  });

  const names = products.map((p) => p.name).join(" vs ");
  const cols = products.length;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Soundz", path: "/" },
          { name: tc("hero.eyebrow"), path: "/hearing-aids" },
          { name: names, path: `/compare/${slug}` },
        ], locale)}
      />
      <SiteHeader />
      <main className="sz-cmp">
        <section className="sz-cmp__hero">
          <div className="sz-container">
            <nav className="sz-cmp__crumbs" aria-label="Breadcrumb">
              <a href={localePath(locale, "/")}>Soundz</a>
              <span aria-hidden>/</span>
              <a href={localePath(locale, "/hearing-aids")}>{tc("hero.eyebrow")}</a>
              <span aria-hidden>/</span>
              <b>{t("hero.eyebrow")}</b>
            </nav>
            <p className="sz-cmp__eyebrow">{t("hero.eyebrow")}</p>
            <h1 className="sz-cmp__title">{names}</h1>
            <p className="sz-cmp__lead">{t("hero.lead")}</p>
          </div>
        </section>

        <section className="sz-container sz-cmp__section">
          <div className="sz-cmp__scroll">
            <table className={`sz-cmp__table sz-cmp__table--${cols}`}>
              <thead>
                <tr>
                  <th scope="col" className="sz-cmp__corner">{t("table.spec")}</th>
                  {products.map((p) => {
                    const href = localePath(locale, `/hearing-aids/${p.brandSlug ?? "brand"}/${p.slug}`);
                    return (
                      <th scope="col" key={p.id} className="sz-cmp__prod">
                        <a className="sz-cmp__prod-media" href={href}>
                          {p.imageUrl ? <img src={mediaUrl(p.imageUrl)} alt={p.name} loading="lazy" /> : <span>Soundz</span>}
                        </a>
                        <span className="sz-cmp__prod-brand">{p.brand ?? "Soundz"}</span>
                        <a className="sz-cmp__prod-name" href={href}>{p.name}</a>
                        <a className="sz-cmp__prod-cta" href={href}>{tc("list.details")} →</a>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className={row.highlight ? "sz-cmp__row--hl" : ""}>
                    <th scope="row">{row.label}</th>
                    {row.values.map((v, i) => (
                      <td key={i}>{v ?? <span className="sz-cmp__na">—</span>}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="sz-container sz-cmp__cta">
          <div>
            <h2>{t("cta.title")}</h2>
            <p>{t("cta.body")}</p>
          </div>
          <div className="sz-cmp__cta-actions">
            <a className="sz-btn sz-btn--primary sz-btn--lg" href={localePath(locale, "/branches")}>
              <span className="sz-btn__label">{t("cta.button")}</span>
            </a>
            <a className="sz-btn sz-btn--ghost sz-btn--lg" href={localePath(locale, "/hearing-aids")}>
              <span className="sz-btn__label">{t("cta.secondary")}</span>
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
