import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/**
 * Brauzer API'ning origin'i. Odatda saytning o'zi (same-origin proxy) — ammo
 * alohida domenga o'tilsa CSP avtomatik moslashsin uchun env'dan olinadi.
 */
function apiOrigin(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1").origin;
  } catch {
    return "";
  }
}

const API_ORIGIN = apiOrigin();
const extraConnect = API_ORIGIN ? ` ${API_ORIGIN}` : "";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://mc.yandex.ru; " +
      `connect-src 'self'${extraConnect} https://www.google-analytics.com https://region1.google-analytics.com https://mc.yandex.ru https://www.facebook.com; ` +
      "img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; " +
      `frame-ancestors 'none'; base-uri 'self'; form-action 'self'${extraConnect}; upgrade-insecure-requests`,
  },
];

/**
 * Eski (WordPress davridan qolgan va birinchi versiyadagi) yo'llar — 301 bilan
 * yangi [locale] tuzilmasiga. Sahifalarning o'zi olib tashlangan; bu yozuvlar
 * tashqi havolalar va indekslangan URL'lar uzilib qolmasligi uchun.
 */
const legacyRedirects = [
  { source: "/eshitish-moslamalari", destination: "/hearing-aids" },
  { source: "/eshitish-moslamalari/:slug", destination: "/hearing-aids" },
  { source: "/ru/eshitish-moslamalari", destination: "/ru/hearing-aids" },
  { source: "/ru/eshitish-moslamalari/:slug", destination: "/ru/hearing-aids" },
  { source: "/filiallar", destination: "/branches" },
  { source: "/filiallar/:slug", destination: "/branches/:slug" },
  { source: "/xizmatlar", destination: "/services" },
  { source: "/xizmatlar/:code", destination: "/services" },
  { source: "/qidiruv", destination: "/search" },
  { source: "/savol-javob", destination: "/faq" },
  { source: "/foydali-malumotlar", destination: "/learn" },
  { source: "/maqolalar", destination: "/learn" },
  { source: "/maqolalar/:slug", destination: "/learn" },
  { source: "/demo", destination: "/" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async headers() { return [{ source: "/(.*)", headers: securityHeaders }]; },
  async redirects() {
    return legacyRedirects.map((rule) => ({ ...rule, permanent: true }));
  },
};

export default withNextIntl(nextConfig);
