import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "../../../components/site/site-header";
import { SiteFooter } from "../../../components/site/site-footer";
import { JsonLd, breadcrumbJsonLd } from "../../../components/seo/json-ld";
import type { Locale } from "../../../i18n/routing";
import { buildPageMetadata, localePath } from "../../../lib/seo";
import { fetchServices } from "../../../lib/locations";
import "../locations.css";

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  return buildPageMetadata({ locale: locale as Locale, title: t("metaTitle"), description: t("metaDesc"), path: "/services" });
}

export default async function ServicesPage({ params }: PageParams) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(rawLocale);
  const t = await getTranslations({ locale: rawLocale, namespace: "services" });
  const services = await fetchServices();

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Soundz", path: "/" }, { name: t("title"), path: "/services" }])} />
      <SiteHeader />
      <main className="sz-loc">
        <section className="sz-loc__hero">
          <div className="sz-container">
            <p className="sz-loc__eyebrow">{t("title")}</p>
            <h1 className="sz-loc__title">{t("title")}</h1>
            <p className="sz-loc__lead">{t("subtitle")}</p>
          </div>
        </section>
        <section className="sz-container sz-loc__section">
          {services.length === 0 ? (
            <div className="sz-loc__empty">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path d="M12 3a4 4 0 0 1 4 4c0 2-1.5 3-2.5 4S12 16 12 17" strokeLinecap="round" />
                <circle cx="12" cy="20.5" r="0.4" fill="currentColor" stroke="none" />
              </svg>
              <h2>{t("empty")}</h2>
              <p>{t("emptyHint")}</p>
              <a className="sz-btn sz-btn--primary sz-btn--md" href={localePath(locale, "/#contact")}>
                <span className="sz-btn__label">{t("book")}</span>
              </a>
            </div>
          ) : (
            <div className="sz-loc__grid">
              {services.map((s) => (
                <article className="sz-loc__card" key={s.id}>
                  <h2>{s.name}</h2>
                  {s.description ? <p>{s.description}</p> : null}
                  <div className="sz-loc__card-foot">
                    {s.durationMinutes ? <span className="sz-loc__pill">{t("duration", { min: s.durationMinutes })}</span> : <span />}
                    <a href={localePath(locale, "/#contact")}>{t("book")} →</a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
