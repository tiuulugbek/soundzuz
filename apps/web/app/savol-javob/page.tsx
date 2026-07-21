import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";
type Faq = { id: string; question: string; shortAnswer: string; fullAnswer?: string; categoryName?: string; relatedArticleSlug?: string };

async function loadFaqs(): Promise<Faq[]> {
  try {
    const response = await fetch(`${API_URL}/content/faqs?locale=uz`, { next: { revalidate: 180 } });
    return response.ok ? await response.json() : [];
  } catch { return []; }
}

export default async function FaqPage() {
  const faqs = await loadFaqs();
  const grouped = Map.groupBy(faqs, (faq) => faq.categoryName ?? "Umumiy savollar");
  return <main style={{ maxWidth: 980, margin: "0 auto", padding: "32px 20px 90px" }}>
    <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 54 }}><Link className="logo" href="/"><span>S</span>Soundz</Link><Link href="/foydali-malumotlar">Bilim markazi</Link></header>
    <p className="eyebrow">TEZ-TEZ BERILADIGAN SAVOLLAR</p>
    <h1 style={{ fontSize: "clamp(42px,7vw,70px)", lineHeight: 1.05, maxWidth: 780 }}>Savolingizga tez va tushunarli javob toping.</h1>
    <form action="/qidiruv" style={{ display: "flex", gap: 10, margin: "32px 0 50px" }}><input name="q" placeholder="Savol yoki kalit so‘z kiriting" style={{ flex: 1, padding: 16, borderRadius: 14, border: "1px solid #bfd5c7" }} /><button className="primary">Qidirish</button></form>
    {[...grouped.entries()].map(([category, items]) => <section key={category} style={{ marginBottom: 42 }}><h2>{category}</h2>{items.map((faq) => <details key={faq.id} style={{ padding: "20px 0", borderBottom: "1px solid #dce8e0" }}><summary style={{ fontSize: 19, fontWeight: 700, cursor: "pointer" }}>{faq.question}</summary><div style={{ paddingTop: 14, lineHeight: 1.7 }}><p>{faq.fullAnswer || faq.shortAnswer}</p>{faq.relatedArticleSlug && <Link href={`/maqolalar/${faq.relatedArticleSlug}`}>Batafsil maqolani o‘qish →</Link>}</div></details>)}</section>)}
    {!faqs.length && <div style={{ padding: 28, borderRadius: 20, background: "#f4f8f5" }}><h2>Savol-javoblar tayyorlanmoqda</h2><p>Admin panel orqali nashr qilingan FAQ javoblari shu yerda kategoriyalar bo‘yicha chiqadi.</p></div>}
  </main>;
}
