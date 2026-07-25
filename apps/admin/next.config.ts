import type { NextConfig } from "next";

/**
 * Brauzer API'ning origin'i. Nisbiy manzil (`/v1`) berilganda bo'sh qaytadi —
 * bu holda CSP uchun `'self'` yetarli (same-origin).
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

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Admin saytning o'zi bilan bir domenda, `/admin` yo'li ostida xizmat qiladi —
  // shunda mavjud SSL sertifikati ishlaydi va alohida DNS yozuvi kerak bo'lmaydi.
  basePath: "/admin",
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        {
          key: "Content-Security-Policy",
          value:
            "default-src 'self'; script-src 'self' 'unsafe-inline'; " +
            `connect-src 'self'${extraConnect}; ` +
            "img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; " +
            `frame-ancestors 'none'; base-uri 'self'; form-action 'self'${extraConnect}; upgrade-insecure-requests`,
        },
      ],
    }];
  },
};

export default nextConfig;
