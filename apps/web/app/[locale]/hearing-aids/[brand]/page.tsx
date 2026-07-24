import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "../../../../components/site/site-header";
import { SiteFooter } from "../../../../components/site/site-footer";
import { JsonLd, breadcrumbJsonLd } from "../../../../components/seo/json-ld";
import type { Locale } from "../../../../i18n/routing";
import { buildPageMetadata, localePath } from "../../../../lib/seo";
import { fetchBrand, formatPrice, mediaUrl } from "../../../../lib/catalog";
import "../catalog.css";

type PageParams = { params: Promise<{ locale: string; brand: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, brand } = await params;
  const data = await fetchBrand(locale as Locale, brand);
  const t = await getTranslations({ locale, namespace: "catalog" });
  const name = data?.name ?? brand;
  return buildPageMetadata({
    locale: locale as Locale,
    title: `${name} — ${t("meta.title")}`,
    description: data?.description ?? t("meta.description"),
    path: `/hearing-aids/${brand}`,
  });
}

export default async function BrandPage({ params }: PageParams) {
  const { locale: rawLocale, brand } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(rawLocale);
  const t = await getTranslations({ locale: rawLocale, namespace: "catalog" });
  const data = await fetchBrand(locale, brand);
  if (!data) notFound();

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: "Soundz", path: "/" },
        { name: t("hero.eyebrow"), path: "/hearing-aids" },
        { name: data.name, path: `/hearing-aids/${brand}` },
      ])} />
      <SiteHeader />
      <main className="sz-cat">
        <section className="sz-cat__hero sz-cat__hero--brand">
          <div className="sz-container">
            <a className="sz-cat__back" href={localePath(locale, "/hearing-aids")}>← {t("product.backToCatalog")}</a>
            <div className="sz-brand__head">
              {data.logoUrl ? <img className="sz-brand__logo" src={mediaUrl(data.logoUrl)} alt={data.name} /> : null}
              <div>
                <h1 className="sz-cat__title">{data.name}</h1>
                {data.tagline ? <p className="sz-cat__lead">{data.tagline}</p> : null}
              </div>
            </div>
            {data.description ? <p className="sz-brand__desc">{data.description}</p> : null}
            {data.websiteUrl ? <a className="sz-brand__site" href={data.websiteUrl} target="_blank" rel="noopener noreferrer">{t("brandPage.visitSite")} →</a> : null}
          </div>
        </section>

        <section className="sz-container sz-brand__products">
          <h2 className="sz-brand__products-title">{t("brandPage.productsTitle", { brand: data.name })}</h2>
          {data.products.length === 0 ? (
            <p className="sz-cat__muted">{t("brandPage.noProducts")}</p>
          ) : (
            <div className="sz-cat__grid">
              {data.products.map((p) => {
                const priceStr = formatPrice(locale, p.priceFrom);
                const href = localePath(locale, `/hearing-aids/${p.brandSlug ?? brand}/${p.slug}`);
                return (
                  <article className="sz-cat__card" key={p.id}>
                    <a className="sz-cat__card-media" href={href}>
                      {p.imageUrl ? <img src={mediaUrl(p.imageUrl)} alt={p.name} loading="lazy" /> : <span>Soundz</span>}
                    </a>
                    <div className="sz-cat__card-meta">
                      <span>{p.brand ?? data.name}</span>
                      <b className={p.inStock ? "" : "sz-cat__badge--muted"}>{p.inStock ? t("list.inStock") : t("list.preOrder")}</b>
                    </div>
                    <h3 className="sz-cat__card-title"><a href={href}>{p.name}</a></h3>
                    {p.shortDescription ? <p className="sz-cat__card-desc">{p.shortDescription}</p> : null}
                    <div className="sz-cat__chips">
                      {p.formFactor ? <span>{p.formFactor}</span> : null}
                      {p.technologyLevel ? <span>{p.technologyLevel}</span> : null}
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
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
