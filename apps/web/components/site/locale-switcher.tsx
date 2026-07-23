"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "../../i18n/navigation";
import { routing } from "../../i18n/routing";

const SHORT: Record<string, string> = { uz: "O‘z", ru: "Ру", en: "En" };

/** Til almashtirgich — joriy sahifani saqlagan holda locale'ni o'zgartiradi. */
export function LocaleSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className={`sz-locale ${className}`.trim()} role="group" aria-label="Til / Язык / Language">
      {routing.locales.map((item) => (
        <Link
          key={item}
          href={pathname}
          locale={item}
          aria-current={item === locale ? "true" : undefined}
          className={`sz-locale__item ${item === locale ? "is-active" : ""}`.trim()}
        >
          {SHORT[item]}
        </Link>
      ))}
    </div>
  );
}
