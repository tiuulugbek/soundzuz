import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Faqat locale bilan bog'liq yo'llar. Legacy uz sahifalari (prefikssiz)
  // va app/ru/* statik sahifalari middleware'dan tashqarida qoladi —
  // ular bosqichma-bosqich [locale] tuzilmasiga ko'chiriladi.
  matcher: ["/", "/(uz|ru|en)", "/(uz|en)/:path+"],
};
