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
  const response = await fetch(`${API_URL}/catalog/products/${encodeURIComponent(slug)}?locale=ru`, {
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
    description: product.seo_description ?? product.short_description ?? "Слуховой аппарат Soundz",
    alternates: {
      canonical: `${SITE_URL}/ru/eshitish-moslamalari/${slug}`,
      languages: {
        "uz-UZ": `${SITE_URL}/eshitish-moslamalari/${slug}`,
        "ru-UZ": `${SITE_URL}/ru/eshitish-moslamalari/${slug}`,
        "x-default": `${SITE_URL}/eshitish-moslamalari/${slug}`,
      },
    },
    openGraph: {
      title: product.seo_title ?? product.name,
      description: product.seo_description ?? product.short_description,
      type: "website",
      url: `${SITE_URL}/ru/eshitish-moslamalari/${slug}`,
    },
  };
}

export default async function RussianProductPage({ params }: { params: Promise<{ slug: string }> }) {
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
    inLanguage: "ru-UZ",
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    image: imageUrl ? [imageUrl] : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "UZS",
      price: product.price_from ? Number(product.price_from) : undefined,
      availability: product.in_stock ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      url: `${SITE_URL}/ru/eshitish-moslamalari/${slug}`,
    },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="site-header">
        <Link className="logo" href="/ru"><span>S</span>Soundz</Link>
        <nav>
          <Link href="/ru/eshitish-moslamalari">Аппараты</Link>
          <Link href="/ru#services">Услуги</Link>
        </nav>
        <Link className="header-cta" href={bookingHref}>Консультация</Link>
      </header>

      <section className="product-detail">
        <div className="product-detail-image">
          {imageUrl ? <img src={imageUrl} alt={product.name} /> : <span>Soundz</span>}
        </div>
        <div className="product-detail-copy">
          <Link className="back-link" href="/ru/eshitish-moslamalari">← Вернуться в каталог</Link>
          <p className="eyebrow">{product.brand ?? "СЛУХОВОЙ АППАРАТ"}</p>
          <h1>{product.name}</h1>
          <p className="lead">{product.short_description ?? product.description}</p>
          <div className="spec-grid">
            <div><span>Форм-фактор</span><strong>{product.form_factor ?? "Индивидуальный"}</strong></div>
            <div><span>Уровень</span><strong>{product.technology_level ?? "Подбирается"}</strong></div>
            <div><span>Питание</span><strong>{product.rechargeable ? "Перезаряжаемый" : "Батарейный"}</strong></div>
            <div><span>Подключение</span><strong>{product.bluetooth ? "Bluetooth" : "Стандартное"}</strong></div>
          </div>
          <div className="detail-price">
            <strong>{product.price_from ? `от ${new Intl.NumberFormat("ru-RU").format(Number(product.price_from))} сум` : "Цена на консультации"}</strong>
            <span>Итоговая цена зависит от конфигурации.</span>
          </div>
          <Link className="primary" href={bookingHref}>Записаться на проверку</Link>
        </div>
      </section>

      <section className="product-description">
        <div>
          <p className="eyebrow">ПОДРОБНО</p>
          <h2>Кому подходит?</h2>
          <div className="article-body">
            {product.description ?? "Аппарат подбирается по результатам аудиометрии и настраивается индивидуально специалистом."}
          </div>
        </div>
        <aside>
          <h3>Перед выбором</h3>
          <ul>
            <li>Проверка слуха</li>
            <li>Оценка анатомии уха</li>
            <li>Анализ образа жизни</li>
            <li>Тестирование и настройка</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
