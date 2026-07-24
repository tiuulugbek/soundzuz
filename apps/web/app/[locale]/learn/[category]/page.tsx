import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "../../../../components/site/site-header";
import { SiteFooter } from "../../../../components/site/site-footer";
import { JsonLd, breadcrumbJsonLd } from "../../../../components/seo/json-ld";
import type { Locale } from "../../../../i18n/routing";
import { buildPageMetadata, localePath } from "../../../../lib/seo";
import { fetchArticles, fetchCategories } from "../../../../lib/content";
import "../learn.css";

type PageParams = { params: Promise<{ locale: string; category: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, category } = await params;
  const cats = await fetchCategories(locale as Locale);
  const cat = cats.find((c) => c.slug === category);
  const t = await getTranslations({ locale, namespace: "learn.meta" });
  return buildPageMetadata({
    locale: locale as Locale,
    title: cat ? `${cat.name} — Soundz` : t("title"),
    description: cat?.description ?? t("description"),
    path: `/learn/${category}`,
  });
}

export default async function LearnCategory({ params }: PageParams) {
  const { locale: rawLocale, category } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(rawLocale);
  const t = await getTranslations({ locale: rawLocale, namespace: "learn" });
  const [cats, articles] = await Promise.all([fetchCategories(locale), fetchArticles(locale, { category, limit: 48 })]);
  const cat = cats.find((c) => c.slug === category);
  if (!cat) notFound();

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: "Soundz", path: "/" },
        { name: t("hero.eyebrow"), path: "/learn" },
        { name: cat.name, path: `/learn/${category}` },
      ])} />
      <SiteHeader />
      <main className="sz-learn">
        <section className="sz-learn__hero">
          <div className="sz-container">
            <a className="sz-learn__back" href={localePath(locale, "/learn")}>← {t("article.backToHub")}</a>
            <h1 className="sz-learn__title">{cat.name}</h1>
            {cat.description ? <p className="sz-learn__lead">{cat.description}</p> : null}
          </div>
        </section>
        <section className="sz-container sz-learn__section">
          {articles.length === 0 ? (
            <p className="sz-learn__muted">{t("list.empty")}</p>
          ) : (
            <div className="sz-learn__grid">
              {articles.map((a) => (
                <article className="sz-learn__card" key={a.id}>
                  <a href={localePath(locale, `/learn/${category}/${a.slug}`)}>
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
