import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "../../../components/site/site-header";
import { SiteFooter } from "../../../components/site/site-footer";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "../../../components/seo/json-ld";
import { WaveCanvas } from "../../../components/ui";
import type { Locale } from "../../../i18n/routing";
import { buildPageMetadata, localePath } from "../../../lib/seo";
import "./iem.css";

type PageParams = { params: Promise<{ locale: string }> };

export const revalidate = 3600;

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "iem.meta" });
  return buildPageMetadata({ locale: locale as Locale, title: t("title"), description: t("description"), path: "/iem" });
}

export default async function IemPage({ params }: PageParams) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "iem" });

  const stats = t.raw("hero.stats") as Array<{ value: string; label: string }>;
  const steps = t.raw("process.steps") as Array<{ title: string; text: string }>;
  const features = t.raw("features.items") as Array<{ title: string; text: string }>;
  const audiences = t.raw("audiences.items") as Array<{ title: string; text: string }>;
  const faq = t.raw("faq.items") as Array<{ q: string; a: string }>;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Soundz", path: "/" },
          { name: t("hero.eyebrow"), path: "/iem" },
        ])}
      />
      <JsonLd data={faqJsonLd(faq.map((f) => ({ question: f.q, answer: f.a })))} />
      <SiteHeader />
      <main className="sz-iemp sz-dark-scope">
        {/* Hero */}
        <section className="sz-iemp__hero">
          <div className="sz-iemp__hero-bg" aria-hidden>
            <div className="sz-iemp__glow" />
            <div className="sz-iemp__wave">
              <WaveCanvas colors={["#ff820118", "#ff820140", "#ffb25e"]} amplitude={0.26} />
            </div>
          </div>
          <div className="sz-container sz-iemp__hero-inner">
            <p className="sz-iemp__eyebrow">{t("hero.eyebrow")}</p>
            <h1 className="sz-iemp__title">{t("hero.title")}</h1>
            <p className="sz-iemp__lead">{t("hero.lead")}</p>
            <div className="sz-iemp__hero-actions">
              <a className="sz-btn sz-btn--primary sz-btn--lg" href={localePath(locale, "/branches")}>
                <span className="sz-btn__label">{t("hero.ctaPrimary")}</span>
              </a>
              <a className="sz-btn sz-btn--ghost sz-btn--lg" href="#process">
                <span className="sz-btn__label">{t("hero.ctaSecondary")}</span>
              </a>
            </div>
            <dl className="sz-iemp__stats">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt>{s.value}</dt>
                  <dd>{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Jarayon */}
        <section id="process" className="sz-container sz-iemp__section">
          <p className="sz-iemp__section-eyebrow">{t("process.eyebrow")}</p>
          <h2 className="sz-iemp__section-title">{t("process.title")}</h2>
          <p className="sz-iemp__section-lead">{t("process.lead")}</p>
          <ol className="sz-iemp__steps">
            {steps.map((step, i) => (
              <li key={step.title}>
                <span className="sz-iemp__step-num">{String(i + 1).padStart(2, "0")}</span>
                <strong>{step.title}</strong>
                <span className="sz-iemp__step-text">{step.text}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Xususiyatlar */}
        <section className="sz-iemp__section sz-iemp__section--alt">
          <div className="sz-container">
            <p className="sz-iemp__section-eyebrow">{t("features.eyebrow")}</p>
            <h2 className="sz-iemp__section-title">{t("features.title")}</h2>
            <div className="sz-iemp__features">
              {features.map((f) => (
                <article key={f.title} className="sz-iemp__feature">
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Galereya (placeholder — asoschi haqiqiy rasmlar bilan almashtiradi) */}
        <section className="sz-container sz-iemp__section">
          <p className="sz-iemp__section-eyebrow">{t("gallery.eyebrow")}</p>
          <h2 className="sz-iemp__section-title">{t("gallery.title")}</h2>
          <p className="sz-iemp__section-lead">{t("gallery.lead")}</p>
          <div className="sz-iemp__gallery">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`sz-iemp__gallery-tile sz-iemp__gallery-tile--${(i % 3) + 1}`} aria-hidden>
                <span>Soundz IEM</span>
              </div>
            ))}
          </div>
        </section>

        {/* Auditoriya */}
        <section className="sz-iemp__section sz-iemp__section--alt">
          <div className="sz-container">
            <p className="sz-iemp__section-eyebrow">{t("audiences.eyebrow")}</p>
            <h2 className="sz-iemp__section-title">{t("audiences.title")}</h2>
            <div className="sz-iemp__audiences">
              {audiences.map((a) => (
                <article key={a.title} className="sz-iemp__audience">
                  <h3>{a.title}</h3>
                  <p>{a.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="sz-container sz-iemp__section">
          <h2 className="sz-iemp__section-title">{t("faq.title")}</h2>
          <div className="sz-iemp__faq">
            {faq.map((f, i) => (
              <details key={f.q} className="sz-iemp__faq-item" {...(i === 0 ? { open: true } : {})}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="sz-container sz-iemp__cta">
          <h2>{t("cta.title")}</h2>
          <p>{t("cta.body")}</p>
          <a className="sz-btn sz-btn--primary sz-btn--lg" href={localePath(locale, "/branches")}>
            <span className="sz-btn__label">{t("cta.button")}</span>
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
