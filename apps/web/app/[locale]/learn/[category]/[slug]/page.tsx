import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "../../../../../components/site/site-header";
import { SiteFooter } from "../../../../../components/site/site-footer";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "../../../../../components/seo/json-ld";
import type { Locale } from "../../../../../i18n/routing";
import { SITE_URL, buildPageMetadata, localePath } from "../../../../../lib/seo";
import { fetchArticle } from "../../../../../lib/content";
import "../../learn.css";

type PageParams = { params: Promise<{ locale: string; category: string; slug: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, category, slug } = await params;
  const a = await fetchArticle(locale as Locale, slug);
  if (!a) return {};
  return buildPageMetadata({
    locale: locale as Locale,
    title: a.seo_title ?? `${a.title} — Soundz`,
    description: a.seo_description ?? a.excerpt ?? a.title,
    path: `/learn/${category}/${slug}`,
  });
}

export default async function ArticlePage({ params }: PageParams) {
  const { locale: rawLocale, category, slug } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(rawLocale);
  const t = await getTranslations({ locale: rawLocale, namespace: "learn" });
  const a = await fetchArticle(locale, slug);
  if (!a) notFound();

  const articleLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    headline: a.title,
    url: `${SITE_URL}${localePath(locale, `/learn/${category}/${slug}`)}`,
    ...(a.excerpt ? { description: a.excerpt } : {}),
    ...(a.author_name ? { author: { "@type": "Organization", name: a.author_name } } : {}),
    ...(a.reviewer_name ? { reviewedBy: { "@type": "Person", name: a.reviewer_name } } : {}),
    ...(a.published_at ? { datePublished: a.published_at } : {}),
    ...(a.last_reviewed_at ? { lastReviewed: a.last_reviewed_at } : {}),
    publisher: { "@type": "Organization", name: "Soundz" },
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: "Soundz", path: "/" },
        { name: t("hero.eyebrow"), path: "/learn" },
        ...(a.categoryName ? [{ name: a.categoryName, path: `/learn/${a.categorySlug ?? category}` }] : []),
        { name: a.title, path: `/learn/${category}/${slug}` },
      ])} />
      <JsonLd data={articleLd} />
      {a.faqs && a.faqs.length > 0 ? (
        <JsonLd data={faqJsonLd(a.faqs.map((f) => ({ question: f.question, answer: f.fullAnswer ?? f.shortAnswer })))} />
      ) : null}
      <SiteHeader />
      <main className="sz-learn sz-article">
        <div className="sz-container sz-article__wrap">
          <a className="sz-learn__back" href={localePath(locale, `/learn/${a.categorySlug ?? category}`)}>← {a.categoryName ?? t("article.backToHub")}</a>
          <h1 className="sz-article__title">{a.title}</h1>
          <div className="sz-article__meta">
            {a.author_name ? <span>{t("article.author")}: {a.author_name}</span> : null}
            {a.reviewer_name ? <span className="sz-article__reviewed">✓ {t("article.reviewedBy")}</span> : null}
            {a.reading_time_minutes ? <span>{t("list.readMin", { min: a.reading_time_minutes })}</span> : null}
          </div>
          <article className="sz-article__body" dangerouslySetInnerHTML={{ __html: a.content }} />
          {a.medical_disclaimer ? (
            <aside className="sz-article__disclaimer">
              <strong>{t("article.disclaimerTitle")}</strong>
              <p>{a.medical_disclaimer}</p>
            </aside>
          ) : null}
          {a.faqs && a.faqs.length > 0 ? (
            <section className="sz-article__faqs">
              <h2>{t("article.related")}</h2>
              {a.faqs.map((f) => (
                <details key={f.id}>
                  <summary>{f.question}</summary>
                  <p>{f.fullAnswer ?? f.shortAnswer}</p>
                </details>
              ))}
            </section>
          ) : null}
          <aside className="sz-cta-block">
            <strong>{t("cta.question")}</strong>
            <div className="sz-cta-block__btns">
              <a className="sz-btn sz-btn--primary sz-btn--md" href={localePath(locale, "/#contact")}>{t("cta.book")}</a>
              <a className="sz-btn sz-btn--ghost sz-btn--md" href={localePath(locale, "/#contact")}>{t("cta.consult")}</a>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
