import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["uz", "ru", "en"],
  defaultLocale: "uz",
  // uz — prefikssiz (soundz.uz/), ru/en — prefiksli (soundz.uz/ru, /en)
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
