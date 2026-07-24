import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "../../../components/site/site-header";
import { SiteFooter } from "../../../components/site/site-footer";
import type { Locale } from "../../../i18n/routing";
import { buildPageMetadata, localePath } from "../../../lib/seo";
import { searchKnowledge } from "../../../lib/content";
import "../learn/learn.css";

type PageParams = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "learn.search" });
  return buildPageMetadata({ locale: locale as Locale, title: t("metaTitle"), description: t("prompt"), path: "/search" });
}

export default async function SearchPage({ params, searchParams }: PageParams) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(rawLocale);
  const t = await getTranslations({ locale: rawLocale, namespace: "learn" });
  const sp = await searchParams;
  const query = typeof sp.q === "string" ? sp.q : "";
  const { articles, faqs } = await searchKnowledge(locale, query);
  const hasQuery = query.trim().length > 0;
  const nothing = hasQuery && articles.length === 0 && faqs.length === 0;

  return (
    <>
      <SiteHeader />
      <main className="sz-learn">
        <section className="sz-learn__hero">
          <div className="sz-container">
            <p className="sz-learn__eyebrow">{t("search.title")}</p>
            <form className="sz-search__form" method="get" action={localePath(locale, "/search")}>
              <input name="q" defaultValue={query} placeholder={t("search.placeholder")} aria-label={t("search.title")} />
              <button className="sz-btn sz-btn--primary sz-btn--md" type="submit">{t("search.button")}</button>
            </form>
          </div>
        </section>

        <section className="sz-container sz-learn__section">
          {!hasQuery ? (
            <p className="sz-learn__muted">{t("search.prompt")}</p>
          ) : nothing ? (
            <>
              <p className="sz-learn__muted">{t("search.empty")}</p>
              <aside className="sz-cta-block">
                <strong>{t("cta.question")}</strong>
                <div className="sz-cta-block__btns">
                  <a className="sz-btn sz-btn--primary sz-btn--md" href={localePath(locale, "/#contact")}>{t("cta.book")}</a>
                  <a className="sz-btn sz-btn--ghost sz-btn--md" href={localePath(locale, "/#contact")}>{t("cta.consult")}</a>
                </div>
              </aside>
            </>
          ) : (
            <>
              <p className="sz-search__summary">{t("search.results", { q: query })}</p>
              {articles.length > 0 ? (
                <div className="sz-search__block">
                  <h2 className="sz-learn__h2">{t("search.articles")}</h2>
                  <div className="sz-learn__grid">
                    {articles.map((a) => (
                      <article className="sz-learn__card" key={a.id}>
                        <a href={localePath(locale, `/learn/${a.categorySlug ?? "hearing-aids"}/${a.slug}`)}>
                          {a.categoryName ? <span className="sz-learn__tag">{a.categoryName}</span> : null}
                          <h3>{a.title}</h3>
                          {a.excerpt ? <p>{a.excerpt}</p> : null}
                        </a>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
              {faqs.length > 0 ? (
                <div className="sz-search__block">
                  <h2 className="sz-learn__h2">{t("search.faqs")}</h2>
                  <div className="sz-faq">
                    {faqs.map((f) => (
                      <details className="sz-faq__item" key={f.id}>
                        <summary>{f.question}</summary>
                        <p>{f.fullAnswer ?? f.shortAnswer}</p>
                      </details>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
