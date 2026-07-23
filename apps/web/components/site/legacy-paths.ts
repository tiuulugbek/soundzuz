import type { Locale } from "../../i18n/routing";

/**
 * Legacy (hali [locale] tuzilmasiga ko'chirilmagan) sahifalarga locale'ga mos
 * havola. Hozircha faqat katalogning ru versiyasi bor; qolganlari uz.
 * Sahifalar ko'chirilgani sari bu helper yo'qoladi.
 */
export function legacyHref(locale: Locale, path: string): string {
  if (locale === "ru" && (path === "/eshitish-moslamalari" || path.startsWith("/eshitish-moslamalari/"))) {
    return `/ru${path}`;
  }
  return path;
}
