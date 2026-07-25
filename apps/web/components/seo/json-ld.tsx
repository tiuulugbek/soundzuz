import type { Locale } from "../../i18n/routing";
import { SITE_URL, localePath } from "../../lib/seo";

/** Locale'ga mos to'liq (absolute) URL — uz prefikssiz, ru/en prefiksli. */
function absolute(locale: Locale, path: string): string {
  return `${SITE_URL}${localePath(locale, path)}`;
}

/** JSON-LD ni xavfsiz render qiluvchi komponent. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON ichidagi </script> hujumini oldini olish uchun < belgilarini escape qilamiz
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Soundz",
    url: SITE_URL,
    slogan: "Love Your Hearing",
    logo: `${SITE_URL}/logo.png`,
    sameAs: [] as string[],
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Soundz",
    url: SITE_URL,
    inLanguage: ["uz", "ru", "en"],
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** Breadcrumb. `path` locale prefiksisiz beriladi — prefiks shu yerda qo'shiladi. */
export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>, locale: Locale = "uz") {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absolute(locale, item.path),
    })),
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function localBusinessJsonLd(
  branch: {
    name: string;
    slug: string;
    address?: string | null;
    phone?: string | null;
    imageUrl?: string | null;
  },
  locale: Locale = "uz",
) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: branch.name,
    url: absolute(locale, `/branches/${branch.slug}`),
    ...(branch.address ? { address: branch.address } : {}),
    ...(branch.phone ? { telephone: branch.phone } : {}),
    ...(branch.imageUrl ? { image: branch.imageUrl } : {}),
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
  };
}

export function productJsonLd(
  product: {
    name: string;
    slug: string;
    /** Brend slug — mahsulot URL'i `/hearing-aids/<brand>/<model>` ko'rinishida. */
    brandSlug?: string | null;
    description?: string | null;
    brand?: string | null;
    imageUrl?: string | null;
    price?: number | null;
    currency?: string;
    inStock?: boolean;
  },
  locale: Locale = "uz",
) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url: absolute(
      locale,
      product.brandSlug ? `/hearing-aids/${product.brandSlug}/${product.slug}` : `/hearing-aids/${product.slug}`,
    ),
    ...(product.description ? { description: product.description } : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(product.imageUrl ? { image: product.imageUrl } : {}),
    ...(product.price
      ? {
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: product.currency ?? "UZS",
            availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
          },
        }
      : {}),
  };
}
