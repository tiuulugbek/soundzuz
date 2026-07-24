import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "../../../components/site/site-header";
import { SiteFooter } from "../../../components/site/site-footer";
import { JsonLd, breadcrumbJsonLd } from "../../../components/seo/json-ld";
import type { Locale } from "../../../i18n/routing";
import { buildPageMetadata, localePath } from "../../../lib/seo";
import { fetchArticles, fetchCategories } from "../../../lib/content";
import "./learn.css";

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "learn.meta" });
  return buildPageMetadata({ locale: locale as Locale, title: t("title"), description: t("description"), path: "/learn" });
}

export default async function LearnHub({ params }: PageParams) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(rawLocale);
  const t = await getTranslations({ locale: rawLocale, namespace: "learn" });
  const [categories, articles] = await Promise.all([fetchCategories(locale), fetchArticles(locale, { limit: 6 })]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Soundz", path: "/" }, { name: t("hero.eyebrow"), path: "/learn" }])} />
      <SiteHeader />
      <main className="sz-learn">
        <section className="sz-learn__hero">
          <div className="sz-container">
            <p className="sz-learn__eyebrow">{t("hero.eyebrow")}</p>
            <h1 className="sz-learn__title">{t("hero.title")}</h1>
            <p className="sz-learn__lead">{t("hero.subtitle")}</p>
            <form className="sz-learn__search" method="get" action={localePath(locale, "/search")}>
              <input name="q" placeholder={t("search.placeholder")} aria-label={t("search.title")} />
              <button className="sz-btn sz-btn--primary sz-btn--md" type="submit">{t("search.button")}</button>
            </form>
          </div>
        </section>

        <section className="sz-container sz-learn__section">
          <h2 className="sz-learn__h2">{t("categories.title")}</h2>
          <div className="sz-learn__cats">
            {categories.map((c) => (
              <a className="sz-learn__cat" key={c.id} href={localePath(locale, `/learn/${c.slug}`)}>
                <h3>{c.name}</h3>
                {c.description ? <p>{c.description}</p> : null}
                <span className="sz-learn__cat-arrow">→</span>
              </a>
            ))}
            <a className="sz-learn__cat sz-learn__cat--faq" href={localePath(locale, "/faq")}>
              <h3>{t("faq.title")}</h3>
              <p>{t("faq.subtitle")}</p>
              <span className="sz-learn__cat-arrow">→</span>
            </a>
          </div>
        </section>

        <section className="sz-container sz-learn__section">
          <h2 className="sz-learn__h2">{t("list.latest")}</h2>
          {articles.length === 0 ? (
            <p className="sz-learn__muted">{t("list.empty")}</p>
          ) : (
            <div className="sz-learn__grid">
              {articles.map((a) => (
                <article className="sz-learn__card" key={a.id}>
                  <a href={localePath(locale, `/learn/${a.categorySlug ?? "hearing-aids"}/${a.slug}`)}>
                    {a.categoryName ? <span className="sz-learn__tag">{a.categoryName}</span> : null}
                    <h3>{a.title}</h3>
                    {a.excerpt ? <p>{a.excerpt}</p> : null}
                    {a.readingTimeMinutes ? <span className="sz-learn__read">{t("list.readMin", { min: a.readingTimeMinutes })}</span> : null}
                  </a>
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
