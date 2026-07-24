import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "../../../../components/site/site-header";
import { SiteFooter } from "../../../../components/site/site-footer";
import { JsonLd, breadcrumbJsonLd } from "../../../../components/seo/json-ld";
import { HearingCheck } from "../../../../components/tools/hearing-check";
import type { Locale } from "../../../../i18n/routing";
import { buildPageMetadata } from "../../../../lib/seo";
import "./hearing-check.css";

type PageParams = { params: Promise<{ locale: string }> };

export const revalidate = 3600;

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools.hearingCheck.meta" });
  return buildPageMetadata({
    locale: locale as Locale,
    title: t("title"),
    description: t("description"),
    path: "/tools/hearing-check",
  });
}

export default async function HearingCheckPage({ params }: PageParams) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "tools.hearingCheck" });
  const points = t.raw("hero.points") as string[];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Soundz", path: "/" },
          { name: t("hero.eyebrow"), path: "/tools/hearing-check" },
        ])}
      />
      <SiteHeader />
      <main className="sz-tool">
        <section className="sz-tool__hero">
          <div className="sz-container sz-tool__hero-grid">
            <div className="sz-tool__hero-copy">
              <p className="sz-tool__eyebrow">{t("hero.eyebrow")}</p>
              <h1 className="sz-tool__title">{t("hero.title")}</h1>
              <p className="sz-tool__lead">{t("hero.lead")}</p>
              <ul className="sz-tool__points">
                {points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            <div className="sz-tool__widget">
              <HearingCheck />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
