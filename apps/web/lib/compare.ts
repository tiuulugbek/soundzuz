import type { Locale } from "../i18n/routing";
import { fetchProduct, formatPrice, type ProductDetail } from "./catalog";

/** Taqqoslash URL segmenti "a-vs-b(-vs-c)" ni mahsulot slug'lariga ajratadi. */
export function parseCompareSlug(slug: string): string[] {
  return slug
    .split("-vs-")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
}

export function buildCompareSlug(slugs: string[]): string {
  return slugs.slice(0, 4).join("-vs-");
}

/** Katalog uchun "ommabop taqqoslashlar" — qo'shni mahsulotlarni juftlashtiradi. */
export function popularComparePairs<T extends { slug: string; name: string }>(
  items: T[],
  max = 4,
): Array<{ slug: string; label: string }> {
  const pairs: Array<{ slug: string; label: string }> = [];
  for (let i = 0; i + 1 < items.length && pairs.length < max; i += 2) {
    const a = items[i];
    const b = items[i + 1];
    pairs.push({ slug: buildCompareSlug([a.slug, b.slug]), label: `${a.name} vs ${b.name}` });
  }
  return pairs;
}

export async function fetchCompareProducts(locale: Locale, slugs: string[]): Promise<ProductDetail[]> {
  const results = await Promise.all(slugs.map((s) => fetchProduct(locale, s)));
  return results.filter((p): p is ProductDetail => Boolean(p));
}

export type CompareRow = { label: string; values: Array<string | null>; highlight?: boolean };

/**
 * Mahsulotlar bo'yicha taqqoslash jadvali qatorlarini quradi:
 * avval asosiy atributlar (brend, narx, holat), so'ng barcha spetsifikatsiyalar
 * (label'lar birlashtiriladi — birinchi mahsulotdagi tartib saqlanadi).
 */
export function buildCompareRows(
  locale: Locale,
  products: ProductDetail[],
  labels: { brand: string; price: string; availability: string; inStock: string; preOrder: string; consult: string },
): CompareRow[] {
  const rows: CompareRow[] = [];

  rows.push({ label: labels.brand, values: products.map((p) => p.brand ?? "—") });
  rows.push({
    label: labels.price,
    highlight: true,
    values: products.map((p) => {
      const price = formatPrice(locale, p.priceFrom);
      return price ? `${price} ${locale === "ru" ? "сум" : locale === "en" ? "UZS" : "so'm"}` : labels.consult;
    }),
  });
  rows.push({
    label: labels.availability,
    values: products.map((p) => (p.inStock ? labels.inStock : labels.preOrder)),
  });

  // Spetsifikatsiyalarni birlashtirish (label bo'yicha)
  const order: string[] = [];
  const seen = new Set<string>();
  for (const p of products) {
    for (const s of p.specs ?? []) {
      if (!seen.has(s.label)) {
        seen.add(s.label);
        order.push(s.label);
      }
    }
  }
  for (const label of order) {
    const values = products.map((p) => {
      const spec = (p.specs ?? []).find((s) => s.label === label);
      if (!spec) return null;
      return spec.unit ? `${spec.value} ${spec.unit}` : spec.value;
    });
    rows.push({ label, values });
  }

  return rows;
}
