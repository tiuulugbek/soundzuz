import { getTranslations } from "next-intl/server";
import { SiteHeader } from "../site/site-header";
import { SiteFooter } from "../site/site-footer";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "../seo/json-ld";
import type { Locale } from "../../i18n/routing";
import { localePath } from "../../lib/seo";
import { fetchProducts, formatPrice, mediaUrl, type Product } from "../../lib/catalog";
import type { HubContent } from "../../lib/catalog-hubs";
import { relatedHubs } from "../../lib/catalog-hubs";

type HubPageProps = {
  locale: Locale;
  /** Locale prefiksisiz yo'l, masalan "/hearing-aids/rechargeable". */
  path: string;
  content: HubContent;
  /** Mahsulotni hubga kiritish sharti. */
  match: (p: Product) => boolean;
  sort?: (a: Product, b: Product) => number;
};

/**
 * Katalog "hub" (dasturlangan SEO) sahifasi: hero + intro + afzalliklar +
 * mahsulot gridi + FAQ (JSON-LD) + bog'liq hublar + CTA. Barcha mahsulotlar
 * bitta katalog so'rovidan olinadi va xotirada predikat bilan filtrlanadi.
 */
export async function HubPage({ locale, path, content, match, sort }: HubPageProps) {
  const t = await getTranslations({ locale, namespace: "hub" });
  const tc = await getTranslations({ locale, namespace: "catalog" });

  const params = new URLSearchParams({ limit: "48" });
  const all = await fetchProducts(locale, params);
  const items = all.items.filter(match).sort(sort ?? (() => 0));

  const catalogHref = localePath(locale, "/hearing-aids");
  const related = relatedHubs(locale, path);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Soundz", path: "/" },
          { name: tc("hero.eyebrow"), path: "/hearing-aids" },
          { name: content.title, path },
        ])}
      />
      {content.faq.length ? (
        <JsonLd data={faqJsonLd(content.faq.map((f) => ({ question: f.q, answer: f.a })))} />
      ) : null}
      <SiteHeader />
      <main className="sz-hub">
        <section className="sz-hub__hero">
          <div className="sz-container">
            <nav className="sz-hub__crumbs" aria-label="Breadcrumb">
              <a href={localePath(locale, "/")}>Soundz</a>
              <span aria-hidden>/</span>
              <a href={catalogHref}>{tc("hero.eyebrow")}</a>
              <span aria-hidden>/</span>
              <b>{content.eyebrow}</b>
            </nav>
            <p className="sz-hub__eyebrow">{content.eyebrow}</p>
            <h1 className="sz-hub__title">{content.title}</h1>
            <p className="sz-hub__lead">{content.lead}</p>
            <div className="sz-hub__hero-actions">
              <a className="sz-btn sz-btn--primary sz-btn--lg" href="#models">
                <span className="sz-btn__label">{t("grid.viewModels")}</span>
              </a>
              <a className="sz-btn sz-btn--ghost sz-btn--lg" href={catalogHref}>
                <span className="sz-btn__label">{t("grid.allCatalog")}</span>
              </a>
            </div>
          </div>
        </section>

        <section className="sz-container sz-hub__intro">
          <div className="sz-hub__prose">
            {content.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <ul className="sz-hub__highlights">
            {content.highlights.map((h, i) => (
              <li key={i}>
                <span className="sz-hub__hl-num">{String(i + 1).padStart(2, "0")}</span>
                <strong>{h.title}</strong>
                <span>{h.body}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="models" className="sz-container sz-hub__models">
          <div className="sz-hub__models-head">
            <h2>{content.title}</h2>
            <span>{t("grid.count", { total: items.length })}</span>
          </div>
          {items.length === 0 ? (
            <div className="sz-hub__empty">
              <p>{t("grid.empty")}</p>
              <a className="sz-btn sz-btn--primary sz-btn--md" href={catalogHref}>
                <span className="sz-btn__label">{t("grid.allCatalog")}</span>
              </a>
            </div>
          ) : (
            <div className="sz-cat__grid">
              {items.map((p) => {
                const priceStr = formatPrice(locale, p.priceFrom);
                const href = localePath(locale, `/hearing-aids/${p.brandSlug ?? "brand"}/${p.slug}`);
                return (
                  <article className="sz-cat__card" key={p.id}>
                    <a className="sz-cat__card-media" href={href}>
                      {p.imageUrl ? <img src={mediaUrl(p.imageUrl)} alt={p.name} loading="lazy" /> : <span>Soundz</span>}
                    </a>
                    <div className="sz-cat__card-meta">
                      <span>{p.brand ?? "Soundz"}</span>
                      <b className={p.inStock ? "" : "sz-cat__badge--muted"}>
                        {p.inStock ? tc("list.inStock") : tc("list.preOrder")}
                      </b>
                    </div>
                    <h3 className="sz-cat__card-title">
                      <a href={href}>{p.name}</a>
                    </h3>
                    {p.shortDescription ? <p className="sz-cat__card-desc">{p.shortDescription}</p> : null}
                    <div className="sz-cat__chips">
                      {p.formFactor ? <span>{p.formFactor}</span> : null}
                      {p.technologyLevel ? <span>{p.technologyLevel}</span> : null}
                      {p.rechargeable ? <span>{tc("filters.rechargeable")}</span> : null}
                      {p.bluetooth ? <span>Bluetooth</span> : null}
                    </div>
                    <div className="sz-cat__card-foot">
                      <strong>{priceStr ? tc("list.priceFrom", { price: priceStr }) : tc("list.priceOnConsult")}</strong>
                      <a href={href}>{tc("list.details")} →</a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {content.faq.length ? (
          <section className="sz-hub__faq-wrap">
            <div className="sz-container">
              <h2 className="sz-hub__faq-title">{t("faq.title")}</h2>
              <div className="sz-hub__faq">
                {content.faq.map((f, i) => (
                  <details key={i} className="sz-hub__faq-item" {...(i === 0 ? { open: true } : {})}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="sz-container sz-hub__related">
          <h2>{t("related.title")}</h2>
          <div className="sz-hub__related-grid">
            {related.map((r) => (
              <a key={r.path} href={localePath(locale, r.path)} className="sz-hub__related-card">
                <span>{r.title}</span>
                <b aria-hidden>→</b>
              </a>
            ))}
          </div>
        </section>

        <section className="sz-hub__cta-wrap">
          <div className="sz-container sz-hub__cta">
            <div>
              <p className="sz-hub__cta-eyebrow">{t("cta.eyebrow")}</p>
              <h2>{t("cta.title")}</h2>
              <p className="sz-hub__cta-lead">{t("cta.body")}</p>
            </div>
            <div className="sz-hub__cta-actions">
              <a className="sz-btn sz-btn--primary sz-btn--lg" href={localePath(locale, "/branches")}>
                <span className="sz-btn__label">{t("cta.button")}</span>
              </a>
              <a className="sz-btn sz-btn--ghost sz-btn--lg" href={localePath(locale, "/tools/hearing-check")}>
                <span className="sz-btn__label">{t("cta.secondary")}</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
