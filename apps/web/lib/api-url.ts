/**
 * API manzillari. Server (SSR/build) va brauzer uchun qoidalar HAR XIL.
 *
 * - Brauzer: `NEXT_PUBLIC_API_URL` nisbiy (`/v1`) bo'lishi mumkin va shunisi
 *   afzal — so'rov sayt turgan domenga ketadi, alohida api.* subdomen kerak emas.
 * - Server: nisbiy manzil ma'nosiz. Next uni build paytida o'z origin'iga nisbatan
 *   hal qilishga urinadi va hech kim tinglamagani uchun prerender 60 soniya
 *   osilib, build yiqiladi. Shu sabab serverda faqat ABSOLUT manzil ishlatiladi.
 */

const LOCAL_FALLBACK = "http://localhost:4000/v1";

/** Server tomon (SSR, sitemap, build) uchun absolut API manzili. */
export function serverApiUrl(): string {
  const internal = process.env.API_INTERNAL_URL;
  if (internal && /^https?:\/\//.test(internal)) return internal;
  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  if (publicUrl && /^https?:\/\//.test(publicUrl)) return publicUrl;
  return LOCAL_FALLBACK;
}

/** Brauzer uchun API manzili — nisbiy bo'lishi mumkin. */
export function browserApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || LOCAL_FALLBACK;
}

/**
 * Media fayl manzili. API'dan kelgan nisbiy yo'lni brauzer ocha oladigan
 * to'liq manzilga aylantiradi (absolut havolalar o'zgarishsiz qoladi).
 */
export function toMediaUrl(url?: string | null): string {
  if (!url) return "";
  if (/^https?:\/\//.test(url)) return url;
  return `${browserApiUrl().replace(/\/v1$/, "")}${url}`;
}
