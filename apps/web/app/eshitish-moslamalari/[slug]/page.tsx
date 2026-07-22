import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://soundz.uz";

const mediaUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  return /^https?:\/\//.test(url) ? url : `${API_URL.replace(/\/v1$/, "")}${url}`;
};

async function getProduct(slug: string) {
  const response = await fetch(`${API_URL}/catalog/products/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) return null;
  return response.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  return {
    title: product.seo_title ?? `${product.name} — Soundz`,
    description: product.seo_description ?? product.short_description ?? "Soundz eshitish moslamasi",
    alternates: { canonical: `${SITE_URL}/eshitish-moslamalari/${slug}` },
    openGraph: {
      title: product.seo_title ?? product.name,
      description: product.seo_description ?? product.short_description,
      type: "website",
      url: `${SITE_URL}/eshitish-moslamalari/${slug}`,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const media = Array.isArray(product.media) ? product.media : [];
  const featured = media.find((item: any) => item.slot === "featured") ?? media[0];
  const image =
    featured?.variants?.find((item: any) => item.key === "hero")?.url ??
    featured?.variants?.find((item: any) => item.key === "card")?.url;
  const imageUrl = mediaUrl(image);
  const bookingHref = `/?product=${encodeURIComponent(product.id)}#booking`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description ?? product.description,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    image: imageUrl ? [imageUrl] : undefined,
    offers: product.price_from
      ? {
          "@type": "Offer",
          priceCurrency: "UZS",
          price: Number(product.price_from),
          availability: product.in_stock ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
          url: `${SITE_URL}/eshitish-moslamalari/${slug}`,
        }
      : {
          "@type": "Offer",
          priceCurrency: "UZS",
          availability: product.in_stock ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
          url: `${SITE_URL}/eshitish-moslamalari/${slug}`,
        },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="site-header">
        <Link className="logo" href="/"><span>S</span>Soundz</Link>
        <nav>
          <Link href="/eshitish-moslamalari">Moslamalar</Link>
          <Link href="/foydali-malumotlar">Bilim markazi</Link>
        </nav>
        <Link className="header-cta" href={bookingHref}>Maslahat olish</Link>
      </header>

      <section className="product-detail">
        <div className="product-detail-image">
          {imageUrl ? <img src={imageUrl} alt={product.name} /> : <span>Soundz</span>}
        </div>
        <div className="product-detail-copy">
          <Link className="back-link" href="/eshitish-moslamalari">← Katalogga qaytish</Link>
          <p className="eyebrow">{product.brand ?? "ESHITISH MOSLAMASI"}</p>
          <h1>{product.name}</h1>
          <p className="lead">{product.short_description ?? product.description}</p>
          <div className="spec-grid">
            <div><span>Korpus</span><strong>{product.form_factor ?? "Individual"}</strong></div>
            <div><span>Daraja</span><strong>{product.technology_level ?? "Moslashtiriladi"}</strong></div>
            <div><span>Quvvat</span><strong>{product.rechargeable ? "Qayta zaryadlanuvchi" : "Batareyali"}</strong></div>
            <div><span>Ulanish</span><strong>{product.bluetooth ? "Bluetooth" : "Standart"}</strong></div>
          </div>
          <div className="detail-price">
            <strong>{product.price_from ? `${new Intl.NumberFormat("uz-UZ").format(Number(product.price_from))} so‘mdan` : "Narx konsultatsiyada"}</strong>
            <span>Yakuniy narx konfiguratsiyaga bog‘liq.</span>
          </div>
          <Link className="primary" href={bookingHref}>Tekshiruvga yozilish</Link>
        </div>
      </section>

      <section className="product-description">
        <div>
          <p className="eyebrow">BATAFSIL</p>
          <h2>Kimlar uchun mos?</h2>
          <div className="article-body">
            {product.description ?? "Moslama audiometriya natijasi va mutaxassis tavsiyasiga ko‘ra individual sozlanadi."}
          </div>
        </div>
        <aside>
          <h3>Tanlashdan oldin</h3>
          <ul>
            <li>Eshitish testi</li>
            <li>Quloq anatomiyasini baholash</li>
            <li>Turmush tarzini aniqlash</li>
            <li>Sinov va individual sozlash</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
