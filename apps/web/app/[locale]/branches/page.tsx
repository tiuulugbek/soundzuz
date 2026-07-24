import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "../../../components/site/site-header";
import { SiteFooter } from "../../../components/site/site-footer";
import { JsonLd, breadcrumbJsonLd } from "../../../components/seo/json-ld";
import type { Locale } from "../../../i18n/routing";
import { buildPageMetadata, localePath } from "../../../lib/seo";
import { fetchBranches, locMediaUrl } from "../../../lib/locations";
import "../locations.css";

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "branches" });
  return buildPageMetadata({ locale: locale as Locale, title: t("metaTitle"), description: t("metaDesc"), path: "/branches" });
}

export default async function BranchesPage({ params }: PageParams) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(rawLocale);
  const t = await getTranslations({ locale: rawLocale, namespace: "branches" });
  const branches = await fetchBranches();

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Soundz", path: "/" }, { name: t("title"), path: "/branches" }])} />
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
          {branches.length === 0 ? (
            <p className="sz-loc__muted">{t("empty")}</p>
          ) : (
            <div className="sz-loc__grid">
              {branches.map((b) => (
                <article className="sz-loc__card sz-loc__branch" key={b.id}>
                  {b.imageUrl ? <a className="sz-loc__branch-img" href={localePath(locale, `/branches/${b.slug}`)}><img src={locMediaUrl(b.imageUrl)} alt={b.name} loading="lazy" /></a> : null}
                  <div className="sz-loc__branch-body">
                    <h2><a href={localePath(locale, `/branches/${b.slug}`)}>{b.name}</a></h2>
                    {b.address ? <p className="sz-loc__addr">{b.address}</p> : null}
                    {b.phone ? <a className="sz-loc__phone" href={`tel:${b.phone.replace(/[^+\d]/g, "")}`}>{b.phone}</a> : null}
                    <a className="sz-loc__more" href={localePath(locale, `/branches/${b.slug}`)}>{t("book")} →</a>
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
