import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "../../i18n/routing";
import { legacyHref } from "./legacy-paths";

/** Sayt pastki qismi — grafit fon, yo'nalish va kompaniya havolalari. */
export async function SiteFooter() {
  const t = await getTranslations("common");
  const f = await getTranslations("home.footer");
  const locale = (await getLocale()) as Locale;
  const year = new Date().getFullYear();

  return (
    <footer className="sz-footer sz-dark-scope">
      <div className="sz-container">
        <div className="sz-footer__top">
          <div className="sz-footer__brand">
            <p className="sz-footer__logo">Soundz</p>
            <p className="sz-footer__tagline">{t("tagline")}</p>
            <p className="sz-footer__note">{f("tagline")}</p>
          </div>
          <nav className="sz-footer__col" aria-label={f("directions")}>
            <p>{f("directions")}</p>
            <a href={legacyHref(locale, "/eshitish-moslamalari")}>{t("nav.hearingAids")}</a>
            <a href="#iem">{t("nav.iem")}</a>
            <a href={legacyHref(locale, "/xizmatlar")}>{t("nav.services")}</a>
          </nav>
          <nav className="sz-footer__col" aria-label={f("company")}>
            <p>{f("company")}</p>
            <a href={legacyHref(locale, "/filiallar")}>{t("nav.branches")}</a>
            <a href={legacyHref(locale, "/foydali-malumotlar")}>{t("nav.knowledge")}</a>
            <a href="#contact">{t("nav.contact")}</a>
          </nav>
        </div>
        <div className="sz-footer__bottom">
          <small>© {year} Soundz. {f("rights")}</small>
        </div>
      </div>
    </footer>
  );
}
