import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Locale bilan bog'liq yo'llar + yangi [locale] bo'limlari (uz prefikssiz va ru/en prefiksli).
  // Legacy uz prefikssiz sahifalari (eshitish-moslamalari, foydali-malumotlar, ...) va
  // app/ru/* statik sahifalari ATAYLAB tashqarida qoladi — buzilmasin.
  // Eslatma: Next.js matcher STATIK string bo'lishi shart.
  matcher: [
    "/",
    "/(uz|ru|en)",
    "/(uz|en)/:path+",
    "/ru/(hearing-aids|learn|faq|search|services|branches)/:path*",
    "/(hearing-aids|learn|faq|search|services|branches)/:path*",
  ],
};
