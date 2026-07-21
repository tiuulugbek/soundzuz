import Link from "next/link";
import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

type Article = {
  slug: string; title: string; excerpt: string; content: string; categoryName?: string;
  author_name?: string; reviewer_name?: string; reading_time_minutes?: number;
  medical_disclaimer?: string; last_reviewed_at?: string; published_at?: string;
};

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let article: Article;
  try {
    const response = await fetch(`${API_URL}/content/articles/${encodeURIComponent(slug)}?locale=uz`, { next: { revalidate: 120 } });
    if (!response.ok) notFound();
    article = await response.json();
  } catch { notFound(); }

  return <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 90px" }}>
    <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 64 }}><Link className="logo" href="/"><span>S</span>Soundz</Link><Link href="/foydali-malumotlar">← Bilim markazi</Link></header>
    <article>
      <p className="eyebrow">{article.categoryName ?? "FOYDALI MA’LUMOT"}</p>
      <h1 style={{ fontSize: "clamp(40px,7vw,72px)", lineHeight: 1.05, margin: "14px 0 22px" }}>{article.title}</h1>
      <p style={{ fontSize: 21, lineHeight: 1.65, color: "#405047" }}>{article.excerpt}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, padding: "20px 0", borderTop: "1px solid #dce8e0", borderBottom: "1px solid #dce8e0", margin: "34px 0" }}>
        {article.author_name && <span>Muallif: <strong>{article.author_name}</strong></span>}
        {article.reviewer_name && <span>Tekshirgan: <strong>{article.reviewer_name}</strong></span>}
        <span>O‘qish vaqti: <strong>{article.reading_time_minutes ?? 5} daqiqa</strong></span>
      </div>
      <div style={{ fontSize: 18, lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{article.content}</div>
      <aside style={{ marginTop: 48, padding: 24, borderRadius: 18, background: "#f4f8f5", lineHeight: 1.6 }}><strong>Muhim eslatma</strong><p>{article.medical_disclaimer ?? "Ushbu ma’lumot umumiy tushuntirish uchun berilgan va individual tibbiy tashxis o‘rnini bosmaydi."}</p></aside>
      <section style={{ marginTop: 36, padding: 30, borderRadius: 22, background: "#153f30", color: "white" }}><h2>Eshitishingizni tekshirtirmoqchimisiz?</h2><p>Filial va qulay vaqtni tanlab, mutaxassis qabuliga yoziling.</p><Link className="primary" href="/#booking">Qabulga yozilish</Link></section>
    </article>
  </main>;
}
