import type { Locale } from "../i18n/routing";

// Server-side fetch: ichki Docker tarmog'i (api:4000) — ishonchli, tashqi DNS'ga bog'liq emas.
// mediaUrl esa brauzer uchun ochiq (public) URL ishlatadi.
const API_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

export function mediaUrl(url?: string | null): string {
  if (!url) return "";
  return /^https?:\/\//.test(url) ? url : `${PUBLIC_API_URL.replace(/\/v1$/, "")}${url}`;
}

export type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  description?: string;
  brand?: string;
  brandSlug?: string;
  formFactor?: string;
  technologyLevel?: string;
  audience?: string;
  priceFrom?: number;
  priceTo?: number;
  rechargeable: boolean;
  bluetooth: boolean;
  inStock: boolean;
  imageUrl?: string;
};

export type ProductMedia = {
  slot: string;
  sortOrder: number;
  variants: Array<{ key: string; url: string; width: number; height: number }>;
};

export type ProductDetail = Product & {
  seoTitle?: string | null;
  seoDescription?: string | null;
  media?: ProductMedia[];
  specs?: Array<{ group?: string | null; label: string; value: string; unit?: string | null }>;
  reviews?: Array<{ author: string; rating: number; title?: string | null; body?: string | null; createdAt: string }>;
  ratingAverage?: number | null;
  ratingCount?: number | null;
};

export type Filters = {
  brands: string[];
  formFactors: string[];
  technologyLevels: string[];
  priceRange: { minPrice: number; maxPrice: number };
};

export type ProductList = {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type Brand = {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  originCountry?: string;
  websiteUrl?: string;
  productCount?: number;
  logoUrl?: string;
};

export type BrandDetail = Brand & { products: Product[] };

const EMPTY_LIST: ProductList = { items: [], total: 0, page: 1, limit: 12, totalPages: 1 };
const EMPTY_FILTERS: Filters = { brands: [], formFactors: [], technologyLevels: [], priceRange: { minPrice: 0, maxPrice: 0 } };

async function safeJson<T>(url: string, fallback: T, revalidate: number): Promise<T> {
  try {
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function fetchProducts(locale: Locale, params: URLSearchParams): Promise<ProductList> {
  const q = new URLSearchParams(params);
  q.set("locale", locale);
  if (!q.has("limit")) q.set("limit", "12");
  return safeJson<ProductList>(`${API_URL}/catalog/products?${q.toString()}`, EMPTY_LIST, 60);
}

export async function fetchFilters(locale: Locale): Promise<Filters> {
  return safeJson<Filters>(`${API_URL}/catalog/filters?locale=${locale}`, EMPTY_FILTERS, 300);
}

export async function fetchProduct(locale: Locale, slug: string): Promise<ProductDetail | null> {
  return safeJson<ProductDetail | null>(`${API_URL}/catalog/products/${encodeURIComponent(slug)}?locale=${locale}`, null, 120);
}

export async function fetchBrands(locale: Locale): Promise<Brand[]> {
  return safeJson<Brand[]>(`${API_URL}/catalog/brands?locale=${locale}`, [], 300);
}

export async function fetchBrand(locale: Locale, slug: string): Promise<BrandDetail | null> {
  return safeJson<BrandDetail | null>(`${API_URL}/catalog/brands/${encodeURIComponent(slug)}?locale=${locale}`, null, 300);
}

export function formatPrice(locale: Locale, value?: number | null): string | null {
  if (!value) return null;
  const nf = new Intl.NumberFormat(locale === "ru" ? "ru-RU" : locale === "en" ? "en-US" : "uz-UZ");
  return nf.format(value);
}
