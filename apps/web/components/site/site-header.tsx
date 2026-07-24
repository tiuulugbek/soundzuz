"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "../../i18n/routing";
import { localePath } from "../../lib/seo";
import { LocaleSwitcher } from "./locale-switcher";

/**
 * Yopishqoq sayt sarlavhasi: scroll boshlanganda shisha (glass) fonga o'tadi,
 * mobil'da ochiladigan menyu. Barcha o'tishlar transform/opacity/backdrop.
 */
export function SiteHeader() {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => { document.documentElement.style.overflow = ""; };
  }, [open]);

  const links = [
    { href: localePath(locale, "/hearing-aids"), label: t("nav.hearingAids") },
    { href: localePath(locale, "/iem"), label: t("nav.iem") },
    { href: localePath(locale, "/services"), label: t("nav.services") },
    { href: localePath(locale, "/learn"), label: t("nav.knowledge") },
    { href: localePath(locale, "/branches"), label: t("nav.branches") },
  ];

  return (
    <header className={`sz-header ${scrolled ? "is-scrolled" : ""} ${open ? "is-open" : ""}`.trim()}>
      <div className="sz-container sz-header__inner">
        <a className="sz-header__logo" href={locale === "uz" ? "/" : `/${locale}`} aria-label="Soundz — bosh sahifa">
          <span className="sz-header__mark" aria-hidden>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M4 12c0-1.5.6-2 1.6-2s1.6.5 1.6 2-.6 2-1.6 2S4 13.5 4 12Z" fill="currentColor" />
              <path d="M9.2 8.5c0-1.8.7-2.5 1.9-2.5s1.9.7 1.9 2.5v7c0 1.8-.7 2.5-1.9 2.5s-1.9-.7-1.9-2.5v-7Z" fill="currentColor" />
              <path d="M15.5 5.5C15.5 3.7 16.2 3 17.4 3s1.9.7 1.9 2.5v13c0 1.8-.7 2.5-1.9 2.5s-1.9-.7-1.9-2.5v-13Z" fill="currentColor" opacity=".55" />
            </svg>
          </span>
          Soundz
        </a>

        <nav className="sz-header__nav" aria-label="Asosiy">
          {links.map((link) => (
            <a key={link.label} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
          ))}
        </nav>

        <div className="sz-header__actions">
          <LocaleSwitcher className="sz-header__locale" />
          <a className="sz-btn sz-btn--primary sz-btn--md sz-header__cta" href="#contact">
            <span className="sz-btn__label">{t("cta.consultation")}</span>
          </a>
          <button
            className="sz-header__burger"
            aria-expanded={open}
            aria-label="Menyu"
            onClick={() => setOpen((value) => !value)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      <div className="sz-header__sheet" aria-hidden={!open}>
        <nav aria-label="Mobil menyu">
          {links.map((link) => (
            <a key={link.label} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
          ))}
          <a className="sz-btn sz-btn--primary sz-btn--lg" href="#contact" onClick={() => setOpen(false)}>
            <span className="sz-btn__label">{t("cta.consultation")}</span>
          </a>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
