import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "../../../components/site/site-header";
import { SiteFooter } from "../../../components/site/site-footer";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "../../../components/seo/json-ld";
import type { Locale } from "../../../i18n/routing";
import { buildPageMetadata, localePath } from "../../../lib/seo";
import { fetchFaqs, groupFaqsByCategory } from "../../../lib/content";
import "../learn/learn.css";

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "learn.faq" });
  return buildPageMetadata({ locale: locale as Locale, title: t("metaTitle"), description: t("metaDesc"), path: "/faq" });
}

export default async function FaqPage({ params }: PageParams) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(rawLocale);
  const t = await getTranslations({ locale: rawLocale, namespace: "learn" });
  const faqs = await fetchFaqs(locale);
  const groups = groupFaqsByCategory(faqs);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Soundz", path: "/" }, { name: t("faq.title"), path: "/faq" }])} />
      {faqs.length > 0 ? (
        <JsonLd data={faqJsonLd(faqs.map((f) => ({ question: f.question, answer: f.fullAnswer ?? f.shortAnswer })))} />
      ) : null}
      <SiteHeader />
      <main className="sz-learn">
        <section className="sz-learn__hero">
          <div className="sz-container">
            <p className="sz-learn__eyebrow">FAQ</p>
            <h1 className="sz-learn__title">{t("faq.title")}</h1>
            <p className="sz-learn__lead">{t("faq.subtitle")}</p>
          </div>
        </section>
        <section className="sz-container sz-learn__section">
          {groups.length === 0 ? (
            <p className="sz-learn__muted">{t("faq.empty")}</p>
          ) : (
            <div className="sz-faq">
              {groups.map((g) => (
                <div className="sz-faq__group" key={g.slug}>
                  <h2 className="sz-faq__cat">{g.name}</h2>
                  {g.items.map((f) => (
                    <details className="sz-faq__item" key={f.id}>
                      <summary>{f.question}</summary>
                      <p>{f.fullAnswer ?? f.shortAnswer}</p>
                      {f.relatedArticleSlug ? (
                        <a className="sz-faq__link" href={localePath(locale, `/learn/hearing-aids/${f.relatedArticleSlug}`)}>{t("article.backToHub")} →</a>
                      ) : null}
                    </details>
                  ))}
                </div>
              ))}
            </div>
          )}
          <aside className="sz-cta-block">
            <strong>{t("cta.question")}</strong>
            <div className="sz-cta-block__btns">
              <a className="sz-btn sz-btn--primary sz-btn--md" href={localePath(locale, "/#contact")}>{t("cta.book")}</a>
              <a className="sz-btn sz-btn--ghost sz-btn--md" href={localePath(locale, "/#contact")}>{t("cta.consult")}</a>
            </div>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
