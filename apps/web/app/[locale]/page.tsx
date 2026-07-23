import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookingForm } from "../../components/booking-form";
import { LeadForm } from "../../components/lead-form";
import { HeroParallax } from "../../components/home/hero-parallax";
import { legacyHref } from "../../components/site/legacy-paths";
import { SiteFooter } from "../../components/site/site-footer";
import { SiteHeader } from "../../components/site/site-header";
import { JsonLd, organizationJsonLd, webSiteJsonLd } from "../../components/seo/json-ld";
import { Button, Counter, Magnetic, Marquee, Reveal, Section, SectionHeading, WaveCanvas } from "../../components/ui";
import type { Locale } from "../../i18n/routing";
import { buildPageMetadata } from "../../lib/seo";
import "../home.css";

const BRANDS = ["Phonak", "Oticon", "Signia", "ReSound", "Widex", "Starkey", "Unitron"];

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.meta" });
  return buildPageMetadata({ locale: locale as Locale, title: t("title"), description: t("description"), path: "/" });
}

const PathIcon = ({ name }: { name: "hearing" | "iem" | "accessories" | "children" }) => {
  const paths: Record<string, React.ReactNode> = {
    hearing: (
      <path d="M9 20c0-2.5-3-3.4-3-8a6 6 0 1 1 12 0c0 2.2-1 3.4-2.2 4.6C14.6 17.8 14 19 14 20.5a2.5 2.5 0 0 1-5 0" strokeLinecap="round" />
    ),
    iem: (
      <>
        <path d="M7 4h10v9a5 5 0 0 1-10 0V4Z" strokeLinejoin="round" />
        <path d="M12 18v3M8.5 7.5h7" strokeLinecap="round" />
      </>
    ),
    accessories: (
      <>
        <rect x="5" y="7" width="14" height="12" rx="3" />
        <path d="M9 7V5a3 3 0 0 1 6 0v2M12 11v4" strokeLinecap="round" />
      </>
    ),
    children: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5" strokeLinecap="round" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      {paths[name]}
    </svg>
  );
};

export default async function HomePage({ params }: PageParams) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const steps = t.raw("steps.items") as Array<{ title: string; text: string }>;
  const stats = t.raw("stats.items") as Array<{ value: number; suffix: string; label: string }>;
  const iemFeatures = t.raw("iem.features") as Array<{ title: string; text: string }>;
  const knowledgeCards = t.raw("knowledge.cards") as Array<{ title: string; text: string }>;
  const contactBullets = t.raw("contact.bullets") as string[];

  const catalogHref = legacyHref(locale, "/eshitish-moslamalari");
  const knowledgeHref = legacyHref(locale, "/foydali-malumotlar");

  const pathCards = [
    { key: "hearing", icon: "hearing" as const, href: catalogHref, dark: false },
    { key: "iem", icon: "iem" as const, href: "#iem", dark: true },
    { key: "accessories", icon: "accessories" as const, href: catalogHref, dark: false },
    { key: "children", icon: "children" as const, href: knowledgeHref, dark: false },
  ];

  return (
    <div className="sz-home">
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={webSiteJsonLd()} />
      <SiteHeader />

      <main>
        {/* ============ HERO ============ */}
        <section className="sz-hero">
          <div className="sz-hero__bg" aria-hidden />
          <div className="sz-container sz-hero__grid">
            <div className="sz-hero__copy">
              <Reveal y={20}>
                <span className="sz-chip">{t("hero.eyebrow")}</span>
              </Reveal>
              <Reveal delay={90}>
                <h1 className="sz-hero__title">
                  {t("hero.title")} <span className="sz-hero__accent">{t("hero.titleAccent")}</span>
                </h1>
              </Reveal>
              <Reveal delay={180}>
                <p className="sz-hero__lead">{t("hero.lead")}</p>
              </Reveal>
              <Reveal delay={260}>
                <div className="sz-hero__actions">
                  <Magnetic>
                    <Button href="#booking" size="lg">{t("hero.ctaPrimary")}</Button>
                  </Magnetic>
                  <Button href={catalogHref} variant="secondary" size="lg">{t("hero.ctaSecondary")}</Button>
                </div>
              </Reveal>
              <Reveal delay={340}>
                <ul className="sz-hero__chips">
                  <li>{t("hero.chips.audiometry")}</li>
                  <li>{t("hero.chips.fitting")}</li>
                  <li>{t("hero.chips.service")}</li>
                </ul>
              </Reveal>
            </div>

            <HeroParallax className="sz-hero__visual">
              <div className="sz-hero__rings" data-depth="0.2" aria-hidden />
              <div className="sz-hero__blob sz-blob" data-depth="0.45" aria-hidden />
              <div className="sz-hero__wave" data-depth="0.7">
                <WaveCanvas />
              </div>
              <div className="sz-hero__card sz-hero__card--sound" data-depth="1.1">
                <span className="sz-hero__card-dot" aria-hidden />
                <strong>{t("hero.cardSound.title")}</strong>
                <small>{t("hero.cardSound.text")}</small>
              </div>
              <div className="sz-hero__card sz-hero__card--brands" data-depth="0.85">
                <strong>{t("hero.cardBrands.title")}</strong>
                <small>{t("hero.cardBrands.text")}</small>
              </div>
            </HeroParallax>
          </div>

          <div className="sz-hero__brands">
            <div className="sz-container">
              <p className="sz-hero__brands-label">{t("brands.label")}</p>
              <Marquee ariaLabel={t("brands.label")} duration={36}>
                {BRANDS.map((brand) => (
                  <span key={brand} className="sz-brandmark">{brand}</span>
                ))}
              </Marquee>
            </div>
          </div>
        </section>

        {/* ============ YO'NALISHLAR ============ */}
        <Section>
          <SectionHeading eyebrow={t("paths.eyebrow")} title={t("paths.title")} lead={t("paths.lead")} />
          <div className="sz-paths">
            {pathCards.map((card, index) => (
              <Reveal key={card.key} delay={index * 90} as="article" className={`sz-path ${card.dark ? "sz-path--dark sz-dark-scope" : ""}`}>
                <a className="sz-path__link" href={card.href}>
                  <span className="sz-path__icon"><PathIcon name={card.icon} /></span>
                  <h3>{t(`paths.${card.key}.title`)}</h3>
                  <p>{t(`paths.${card.key}.text`)}</p>
                  <span className="sz-path__cta">
                    {t(`paths.${card.key}.link`)} <span aria-hidden>→</span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ============ QADAMLAR ============ */}
        <Section tone="warm" className="sz-steps-section">
          <SectionHeading eyebrow={t("steps.eyebrow")} title={t("steps.title")} lead={t("steps.lead")} />
          <Reveal className="sz-steps">
            <div className="sz-steps__line" aria-hidden />
            {steps.map((step, index) => (
              <article className="sz-step" key={step.title} style={{ transitionDelay: `${index * 120}ms` }}>
                <span className="sz-step__num">{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </Reveal>
          <div className="sz-stats">
            <p className="sz-eyebrow">{t("stats.eyebrow")}</p>
            <div className="sz-stats__grid">
              {stats.map((stat) => (
                <div className="sz-stat" key={stat.label}>
                  <span className="sz-stat__value">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </span>
                  <span className="sz-stat__label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ============ CUSTOM IEM ============ */}
        <Section tone="dark" id="iem" className="sz-iem">
          <div className="sz-iem__grid">
            <div>
              <SectionHeading align="start" eyebrow={t("iem.eyebrow")} title={t("iem.title")} lead={t("iem.lead")} />
              <ul className="sz-iem__features">
                {iemFeatures.map((feature, index) => (
                  <Reveal key={feature.title} as="li" delay={index * 110}>
                    <strong>{feature.title}</strong>
                    <span>{feature.text}</span>
                  </Reveal>
                ))}
              </ul>
              <Reveal delay={200}>
                <Magnetic>
                  <Button href="#contact" size="lg">{t("iem.cta")}</Button>
                </Magnetic>
              </Reveal>
            </div>
            <div className="sz-iem__visual" aria-hidden>
              <div className="sz-iem__glow" />
              <div className="sz-iem__blob sz-blob" />
              <div className="sz-iem__wave"><WaveCanvas colors={["#ff820118", "#ff820140", "#ffb25e"]} amplitude={0.26} /></div>
            </div>
          </div>
        </Section>

        {/* ============ BILIM MARKAZI ============ */}
        <Section>
          <SectionHeading eyebrow={t("knowledge.eyebrow")} title={t("knowledge.title")} lead={t("knowledge.lead")} />
          <div className="sz-knowledge">
            {knowledgeCards.map((card, index) => (
              <Reveal key={card.title} delay={index * 90} as="article" className="sz-card sz-card--hover sz-knowledge__card">
                <a href={knowledgeHref}>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <span className="sz-path__cta">{t("knowledge.read")} <span aria-hidden>→</span></span>
                </a>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ============ BRON QILISH ============ */}
        <section className="booking-section" id="booking">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t("booking.eyebrow")}</p>
              <h2>{t("booking.title")}</h2>
            </div>
            <p>{t("booking.lead")}</p>
          </div>
          <BookingForm locale={locale === "ru" ? "ru" : "uz"} />
        </section>

        {/* ============ ALOQA ============ */}
        <section className="contact-section" id="contact">
          <div className="contact-copy">
            <p className="eyebrow">{t("contact.eyebrow")}</p>
            <h2>{t("contact.title")}</h2>
            <p>{t("contact.lead")}</p>
            <ul>
              {contactBullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
          <LeadForm />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
