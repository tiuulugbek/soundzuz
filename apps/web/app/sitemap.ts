import type { MetadataRoute } from "next";
import { routing, type Locale } from "../i18n/routing";
import { serverApiUrl } from "../lib/api-url";
import { SITE_URL, localePath } from "../lib/seo";

const locales = routing.locales;

// SSR fetch — ichki API URL (tashqi domen konteyner ichidan ulanmaydi).
const API_URL = serverApiUrl();

type Entry = MetadataRoute.Sitemap[number];

/** Bitta yo'lni uch tilda (uz prefikssiz, ru/en prefiksli) sitemap yozuviga aylantiradi. */
function forAllLocales(path: string, priority: number, changeFrequency: Entry["changeFrequency"], lastModified?: Date): Entry[] {
  return locales.map((locale, index) => ({
    url: `${SITE_URL}${localePath(locale, path)}`,
    changeFrequency,
    // ru/en biroz pastroq — uz asosiy til.
    priority: index === 0 ? priority : Math.max(0.1, priority - 0.15),
    ...(lastModified ? { lastModified } : {}),
  }));
}

async function getJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

/** Statik bo'limlar — barcha tillarda mavjud. */
const STATIC_PATHS: Array<{ path: string; priority: number; changeFrequency: Entry["changeFrequency"] }> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/hearing-aids", priority: 0.9, changeFrequency: "daily" },
  { path: "/hearing-aids/prices", priority: 0.8, changeFrequency: "weekly" },
  { path: "/hearing-aids/rechargeable", priority: 0.75, changeFrequency: "weekly" },
  { path: "/hearing-aids/bluetooth", priority: 0.75, changeFrequency: "weekly" },
  { path: "/hearing-aids/invisible", priority: 0.75, changeFrequency: "weekly" },
  { path: "/hearing-aids/for-children", priority: 0.75, changeFrequency: "weekly" },
  { path: "/hearing-aids/type/ric", priority: 0.7, changeFrequency: "weekly" },
  { path: "/hearing-aids/type/bte", priority: 0.7, changeFrequency: "weekly" },
  { path: "/hearing-aids/type/ite", priority: 0.7, changeFrequency: "weekly" },
  { path: "/hearing-aids/type/cic", priority: 0.7, changeFrequency: "weekly" },
  { path: "/hearing-aids/type/iic", priority: 0.7, changeFrequency: "weekly" },
  { path: "/iem", priority: 0.8, changeFrequency: "weekly" },
  { path: "/learn", priority: 0.85, changeFrequency: "daily" },
  { path: "/faq", priority: 0.8, changeFrequency: "weekly" },
  { path: "/services", priority: 0.8, changeFrequency: "weekly" },
  { path: "/branches", priority: 0.8, changeFrequency: "weekly" },
  { path: "/tools/hearing-check", priority: 0.75, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: Entry[] = STATIC_PATHS.flatMap((item) =>
    forAllLocales(item.path, item.priority, item.changeFrequency),
  );

  // Dinamik yo'llar har bir til uchun alohida olinadi — kontent per-locale qatorlarda saqlanadi.
  await Promise.all(
    locales.map(async (locale: Locale) => {
      const [brands, products, categories, articles, branches] = await Promise.all([
        getJson<any[]>(`${API_URL}/catalog/brands?locale=${locale}`, []),
        getJson<any>(`${API_URL}/catalog/products?locale=${locale}&limit=100`, { items: [] }),
        getJson<any[]>(`${API_URL}/content/categories?locale=${locale}`, []),
        getJson<any[]>(`${API_URL}/content/articles?locale=${locale}&limit=200`, []),
        getJson<any[]>(`${API_URL}/locations/branches`, []),
      ]);

      const productItems: any[] = Array.isArray(products) ? products : (products?.items ?? []);

      for (const brand of brands) {
        if (!brand?.slug) continue;
        entries.push({
          url: `${SITE_URL}${localePath(locale, `/hearing-aids/${brand.slug}`)}`,
          changeFrequency: "weekly",
          priority: 0.75,
        });
      }

      for (const product of productItems) {
        // brandSlug'siz mahsulot URL'i noto'g'ri bo'lardi — bunday yozuvni chiqarmaymiz.
        if (!product?.slug || !product?.brandSlug) continue;
        entries.push({
          url: `${SITE_URL}${localePath(locale, `/hearing-aids/${product.brandSlug}/${product.slug}`)}`,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }

      for (const category of categories) {
        if (!category?.slug) continue;
        entries.push({
          url: `${SITE_URL}${localePath(locale, `/learn/${category.slug}`)}`,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }

      for (const article of articles) {
        if (!article?.slug || !article?.categorySlug) continue;
        entries.push({
          url: `${SITE_URL}${localePath(locale, `/learn/${article.categorySlug}/${article.slug}`)}`,
          lastModified: article.publishedAt ? new Date(article.publishedAt) : undefined,
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }

      // Filiallar tildan qat'i nazar bitta ro'yxat — har tilda o'z URL'i bilan.
      for (const branch of branches) {
        if (!branch?.slug) continue;
        entries.push({
          url: `${SITE_URL}${localePath(locale, `/branches/${branch.slug}`)}`,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }),
  );

  // Bir xil URL ikki marta tushmasligi uchun (masalan bir nechta manbadan).
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
