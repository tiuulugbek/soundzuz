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
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
