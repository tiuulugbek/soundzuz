import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";
type Article = { id: string; slug: string; title: string; excerpt: string; categoryName?: string };
type Faq = { id: string; question: string; shortAnswer: string; categoryName?: string };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = (await searchParams).q?.trim() ?? "";
  let data: { articles: Article[]; faqs: Faq[] } = { articles: [], faqs: [] };
  if (q) {
    try {
      const response = await fetch(`${API_URL}/content/search?locale=uz&q=${encodeURIComponent(q)}`, { cache: "no-store" });
      if (response.ok) data = await response.json();
    } catch {}
  }
  return <main style={{ maxWidth: 980, margin: "0 auto", padding: "32px 20px 90px" }}>
    <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 54 }}><Link className="logo" href="/"><span>S</span>Soundz</Link><Link href="/foydali-malumotlar">Bilim markazi</Link></header>
    <p className="eyebrow">SAYT ICHIDA QIDIRUV</p><h1 style={{ fontSize: "clamp(40px,6vw,64px)" }}>{q ? `“${q}” bo‘yicha natijalar` : "Nimani bilmoqchisiz?"}</h1>
    <form action="/qidiruv" style={{ display: "flex", gap: 10, margin: "28px 0 48px" }}><input name="q" defaultValue={q} placeholder="Savolingizni oddiy tilda yozing" style={{ flex: 1, padding: 16, borderRadius: 14, border: "1px solid #bfd5c7" }} /><button className="primary">Qidirish</button></form>
    {q && !data.articles.length && !data.faqs.length && <div style={{ padding: 26, background: "#f4f8f5", borderRadius: 18 }}><h2>Hozircha aniq javob topilmadi</h2><p>Boshqa kalit so‘z bilan qidiring yoki mutaxassis bilan bog‘laning.</p><Link href="/#contact">Savol qoldirish →</Link></div>}
    {!!data.articles.length && <section style={{ marginBottom: 44 }}><h2>Maqolalar</h2>{data.articles.map((item) => <article key={item.id} style={{ padding: "20px 0", borderBottom: "1px solid #dce8e0" }}><small>{item.categoryName}</small><h3><Link href={`/maqolalar/${item.slug}`}>{item.title}</Link></h3><p>{item.excerpt}</p></article>)}</section>}
    {!!data.faqs.length && <section><h2>Savol-javoblar</h2>{data.faqs.map((item) => <article key={item.id} style={{ padding: "18px 0", borderBottom: "1px solid #dce8e0" }}><small>{item.categoryName}</small><h3>{item.question}</h3><p>{item.shortAnswer}</p></article>)}</section>}
  </main>;
}
