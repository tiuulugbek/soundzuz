import type { Metadata } from "next";
import type { Locale } from "../i18n/routing";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://soundz.uz";

/** Berilgan locale va yo'l uchun URL path (uz — prefikssiz). */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path;
  if (locale === "uz") return clean || "/";
  return `/${locale}${clean}`;
}

/** hreflang alternates: uz-UZ, ru-UZ, en + x-default. */
export function buildAlternates(locale: Locale, path = "/"): NonNullable<Metadata["alternates"]> {
  return {
    canonical: localePath(locale, path),
    languages: {
      "uz-UZ": localePath("uz", path),
      "ru-UZ": localePath("ru", path),
      en: localePath("en", path),
      "x-default": localePath("uz", path),
    },
  };
}

type PageMetadataInput = {
  locale: Locale;
  title: string;
  description: string;
  /** Locale prefiksisiz yo'l, masalan "/" yoki "/iem" */
  path?: string;
  ogImage?: string;
};

const OG_LOCALE: Record<Locale, string> = { uz: "uz_UZ", ru: "ru_RU", en: "en_US" };

/** Har bir sahifa uchun standart, hreflang'li metadata quruvchi. */
export function buildPageMetadata({ locale, title, description, path = "/", ogImage }: PageMetadataInput): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      type: "website",
      siteName: "Soundz",
      locale: OG_LOCALE[locale],
      title,
      description,
      url: localePath(locale, path),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
