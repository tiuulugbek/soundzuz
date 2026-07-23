import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://mc.yandex.ru; connect-src 'self' https://api.soundz.uz https://www.google-analytics.com https://region1.google-analytics.com https://mc.yandex.ru https://www.facebook.com; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://api.soundz.uz; upgrade-insecure-requests" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async headers() { return [{ source: "/(.*)", headers: securityHeaders }]; },
};

export default withNextIntl(nextConfig);
