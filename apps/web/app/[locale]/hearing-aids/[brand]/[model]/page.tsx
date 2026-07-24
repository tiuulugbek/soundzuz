import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "../../../../../components/site/site-header";
import { SiteFooter } from "../../../../../components/site/site-footer";
import { JsonLd, breadcrumbJsonLd, productJsonLd } from "../../../../../components/seo/json-ld";
import type { Locale } from "../../../../../i18n/routing";
import { buildPageMetadata, localePath } from "../../../../../lib/seo";
import { fetchProduct, formatPrice, mediaUrl } from "../../../../../lib/catalog";
import "../../catalog.css";

type PageParams = { params: Promise<{ locale: string; brand: string; model: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, brand, model } = await params;
  const product = await fetchProduct(locale as Locale, model);
  if (!product) return {};
  const title = product.seoTitle ?? `${product.name} — Soundz`;
  const description = product.seoDescription ?? product.shortDescription ?? product.name;
  return buildPageMetadata({
    locale: locale as Locale,
    title,
    description,
    path: `/hearing-aids/${brand}/${model}`,
    ogImage: product.imageUrl ? mediaUrl(product.imageUrl) : undefined,
  });
}

export default async function ProductPage({ params }: PageParams) {
  const { locale: rawLocale, brand, model } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(rawLocale);
  const t = await getTranslations({ locale: rawLocale, namespace: "catalog" });
  const product = await fetchProduct(locale, model);
  if (!product) notFound();

  const priceStr = formatPrice(locale, product.priceFrom);
  const hero = product.imageUrl
    ? mediaUrl(product.imageUrl)
    : product.media?.find((m) => m.slot === "featured")?.variants?.[0]?.url;
  const heroUrl = hero ? mediaUrl(hero) : "";
  const catalogHref = localePath(locale, "/hearing-aids");
  const brandHref = localePath(locale, `/hearing-aids/${product.brandSlug ?? brand}`);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: "Soundz", path: "/" },
        { name: t("hero.eyebrow"), path: "/hearing-aids" },
        { name: product.brand ?? brand, path: `/hearing-aids/${product.brandSlug ?? brand}` },
        { name: product.name, path: `/hearing-aids/${brand}/${model}` },
      ])} />
      <JsonLd data={productJsonLd({
        name: product.name,
        slug: product.slug,
        description: product.description ?? product.shortDescription,
        brand: product.brand,
        imageUrl: heroUrl || undefined,
        price: product.priceFrom,
        inStock: product.inStock,
      })} />
      <SiteHeader />
      <main className="sz-cat sz-pdp">
        <div className="sz-container">
          <nav className="sz-pdp__crumbs" aria-label="breadcrumb">
            <a href={catalogHref}>{t("product.backToCatalog")}</a>
          </nav>

          <div className="sz-pdp__top">
            <div className="sz-pdp__media">
              {heroUrl ? <img src={heroUrl} alt={product.name} /> : <span>Soundz</span>}
            </div>
            <div className="sz-pdp__intro">
              {product.brand ? <a className="sz-pdp__brand" href={brandHref}>{product.brand}</a> : null}
              <h1 className="sz-pdp__title">{product.name}</h1>
              {product.shortDescription ? <p className="sz-pdp__lead">{product.shortDescription}</p> : null}
              <div className="sz-pdp__chips">
                {product.formFactor ? <span>{product.formFactor}</span> : null}
                {product.technologyLevel ? <span>{product.technologyLevel}</span> : null}
                {product.rechargeable ? <span>{t("product.rechargeable")}</span> : null}
                {product.bluetooth ? <span>Bluetooth</span> : null}
              </div>
              {product.ratingCount ? (
                <p className="sz-pdp__rating">★ {t("product.rating", { average: product.ratingAverage ?? 0, count: product.ratingCount })}</p>
              ) : null}
              <div className="sz-pdp__buy">
                <strong>{priceStr ? t("product.priceFrom", { price: priceStr }) : t("product.priceOnConsult")}</strong>
                <a className="sz-btn sz-btn--primary sz-btn--lg" href="#contact">{t("product.consult")}</a>
              </div>
            </div>
          </div>

          {product.description ? (
            <section className="sz-pdp__section">
              <p className="sz-pdp__body">{product.description}</p>
            </section>
          ) : null}

          {product.audience ? (
            <section className="sz-pdp__section">
              <h2>{t("product.whoFor")}</h2>
              <p className="sz-pdp__body">{product.audience}</p>
            </section>
          ) : null}

          {product.specs && product.specs.length > 0 ? (
            <section className="sz-pdp__section">
              <h2>{t("product.specs")}</h2>
              <dl className="sz-pdp__specs">
                {product.specs.map((s, i) => (
                  <div className="sz-pdp__spec" key={`${s.label}-${i}`}>
                    <dt>{s.label}</dt>
                    <dd>{s.value}{s.unit ? ` ${s.unit}` : ""}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <section className="sz-pdp__section">
            <h2>{t("product.reviews")}</h2>
            {product.reviews && product.reviews.length > 0 ? (
              <div className="sz-pdp__reviews">
                {product.reviews.map((r, i) => (
                  <article className="sz-pdp__review" key={i}>
                    <div className="sz-pdp__review-head"><strong>{r.author}</strong><span>{"★".repeat(Math.round(r.rating))}</span></div>
                    {r.title ? <p className="sz-pdp__review-title">{r.title}</p> : null}
                    {r.body ? <p>{r.body}</p> : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="sz-pdp__muted">{t("product.noReviews")}</p>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
