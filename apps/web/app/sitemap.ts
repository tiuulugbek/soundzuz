import type { MetadataRoute } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://soundz.uz";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/ru`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/eshitish-moslamalari`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/ru/eshitish-moslamalari`, changeFrequency: "daily", priority: 0.85 },
    { url: `${SITE_URL}/foydali-malumotlar`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/filiallar`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/xizmatlar`, changeFrequency: "weekly", priority: 0.8 },
  ];

  try {
    const [uzProductsResponse, ruProductsResponse, articlesResponse, branchesResponse, servicesResponse] = await Promise.all([
      fetch(`${API_URL}/catalog/products?locale=uz&limit=48`, { next: { revalidate: 3600 } }),
      fetch(`${API_URL}/catalog/products?locale=ru&limit=48`, { next: { revalidate: 3600 } }),
      fetch(`${API_URL}/content/articles?locale=uz&limit=100`, { next: { revalidate: 3600 } }),
      fetch(`${API_URL}/locations/branches`, { next: { revalidate: 3600 } }),
      fetch(`${API_URL}/locations/services`, { next: { revalidate: 3600 } }),
    ]);

    const uzPayload = uzProductsResponse.ok ? await uzProductsResponse.json() : { items: [] };
    const ruPayload = ruProductsResponse.ok ? await ruProductsResponse.json() : { items: [] };
    const uzProducts = Array.isArray(uzPayload) ? uzPayload : (uzPayload.items ?? []);
    const ruProducts = Array.isArray(ruPayload) ? ruPayload : (ruPayload.items ?? []);
    const articles = articlesResponse.ok ? await articlesResponse.json() : [];
    const branches = branchesResponse.ok ? await branchesResponse.json() : [];
    const services = servicesResponse.ok ? await servicesResponse.json() : [];

    return [
      ...base,
      ...uzProducts.map((product: any) => ({
        url: `${SITE_URL}/eshitish-moslamalari/${product.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...ruProducts.map((product: any) => ({
        url: `${SITE_URL}/ru/eshitish-moslamalari/${product.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.75,
      })),
      ...articles.map((article: any) => ({
        url: `${SITE_URL}/maqolalar/${article.slug}`,
        lastModified: article.publishedAt ? new Date(article.publishedAt) : undefined,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      ...branches.map((branch: any) => ({
        url: `${SITE_URL}/filiallar/${branch.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.75,
      })),
      ...services.map((service: any) => ({
        url: `${SITE_URL}/xizmatlar/${service.code}`,
        changeFrequency: "monthly" as const,
        priority: 0.75,
      })),
    ];
  } catch {
    return base;
  }
}
