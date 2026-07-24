import type { Locale } from "../i18n/routing";

const API_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

export function contentMediaUrl(url?: string | null): string {
  if (!url) return "";
  return /^https?:\/\//.test(url) ? url : `${PUBLIC_API_URL.replace(/\/v1$/, "")}${url}`;
}

export type Category = { id: string; slug: string; name: string; description?: string | null; sortOrder: number };

export type ArticleSummary = {
  id: string;
  slug: string;
  locale: string;
  title: string;
  excerpt?: string | null;
  featuredImageUrl?: string | null;
  readingTimeMinutes?: number | null;
  authorName?: string | null;
  reviewerName?: string | null;
  publishedAt?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
};

/** getArticle SELECT a.* qaytaradi — asosiy maydonlar snake_case. */
export type ArticleDetail = {
  id: string;
  slug: string;
  locale: string;
  title: string;
  excerpt?: string | null;
  content: string;
  featured_image_url?: string | null;
  author_name?: string | null;
  reviewer_name?: string | null;
  medical_disclaimer?: string | null;
  reading_time_minutes?: number | null;
  seo_title?: string | null;
  seo_description?: string | null;
  published_at?: string | null;
  last_reviewed_at?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  faqs?: Array<{ id: string; question: string; shortAnswer: string; fullAnswer?: string | null; sortOrder: number }>;
};

export type Faq = {
  id: string;
  question: string;
  shortAnswer: string;
  fullAnswer?: string | null;
  sortOrder: number;
  categoryName?: string | null;
  categorySlug?: string | null;
  relatedArticleSlug?: string | null;
};

async function safeJson<T>(url: string, fallback: T, revalidate: number): Promise<T> {
  try {
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function fetchCategories(locale: Locale): Promise<Category[]> {
  return safeJson<Category[]>(`${API_URL}/content/categories?locale=${locale}`, [], 300);
}

export async function fetchArticles(locale: Locale, opts: { category?: string; search?: string; limit?: number } = {}): Promise<ArticleSummary[]> {
  const q = new URLSearchParams({ locale });
  if (opts.category) q.set("category", opts.category);
  if (opts.search) q.set("q", opts.search);
  q.set("limit", String(opts.limit ?? 24));
  return safeJson<ArticleSummary[]>(`${API_URL}/content/articles?${q.toString()}`, [], 120);
}

export async function fetchArticle(locale: Locale, slug: string): Promise<ArticleDetail | null> {
  return safeJson<ArticleDetail | null>(`${API_URL}/content/articles/${encodeURIComponent(slug)}?locale=${locale}`, null, 120);
}

export async function fetchFaqs(locale: Locale, opts: { category?: string; search?: string } = {}): Promise<Faq[]> {
  const q = new URLSearchParams({ locale });
  if (opts.category) q.set("category", opts.category);
  if (opts.search) q.set("q", opts.search);
  return safeJson<Faq[]>(`${API_URL}/content/faqs?${q.toString()}`, [], 300);
}

export async function searchKnowledge(locale: Locale, query: string): Promise<{ articles: ArticleSummary[]; faqs: Faq[] }> {
  if (!query.trim()) return { articles: [], faqs: [] };
  const q = new URLSearchParams({ locale, q: query });
  return safeJson<{ articles: ArticleSummary[]; faqs: Faq[] }>(`${API_URL}/content/search?${q.toString()}`, { articles: [], faqs: [] }, 30);
}

/** FAQ'larni kategoriya bo'yicha guruhlaydi (FAQ sahifasi uchun). */
export function groupFaqsByCategory(faqs: Faq[]): Array<{ slug: string; name: string; items: Faq[] }> {
  const map = new Map<string, { slug: string; name: string; items: Faq[] }>();
  for (const f of faqs) {
    const slug = f.categorySlug ?? "general";
    const name = f.categoryName ?? "";
    if (!map.has(slug)) map.set(slug, { slug, name, items: [] });
    map.get(slug)!.items.push(f);
  }
  return Array.from(map.values());
}
