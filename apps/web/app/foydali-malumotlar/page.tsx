import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

type Category = { id: string; slug: string; name: string; description?: string };
type Article = { id: string; slug: string; title: string; excerpt: string; categoryName?: string; readingTimeMinutes: number };

async function loadData(): Promise<{ categories: Category[]; articles: Article[] }> {
  try {
    const [categoryResponse, articleResponse] = await Promise.all([
      fetch(`${API_URL}/content/categories?locale=uz`, { next: { revalidate: 300 } }),
      fetch(`${API_URL}/content/articles?locale=uz&limit=12`, { next: { revalidate: 120 } }),
    ]);
    return {
      categories: categoryResponse.ok ? await categoryResponse.json() : [],
      articles: articleResponse.ok ? await articleResponse.json() : [],
    };
  } catch {
    return { categories: [], articles: [] };
  }
}

export default async function KnowledgeHubPage() {
  const { categories, articles } = await loadData();
  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 20px 80px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, marginBottom: 54 }}>
        <Link className="logo" href="/"><span>S</span>Soundz</Link>
        <nav style={{ display: "flex", gap: 20 }}><Link href="/">Bosh sahifa</Link><Link href="/savol-javob">Savol-javoblar</Link></nav>
      </header>

      <section style={{ padding: "56px", borderRadius: 32, background: "linear-gradient(135deg,#eef8f2,#f8fbf9)", marginBottom: 42 }}>
        <p className="eyebrow">SOUNDZ BILIM MARKAZI</p>
        <h1 style={{ maxWidth: 760, fontSize: "clamp(38px,6vw,68px)", lineHeight: 1.04, margin: "12px 0 18px" }}>Eshitish bo‘yicha savollaringizga tushunarli javoblar.</h1>
        <p style={{ maxWidth: 720, fontSize: 19, lineHeight: 1.7 }}>Audiometriya, eshitish pasayishi, moslamalar, tinnitus va eshitishni asrash bo‘yicha mutaxassis tekshirgan foydali ma’lumotlar.</p>
        <form action="/qidiruv" style={{ display: "flex", gap: 10, maxWidth: 680, marginTop: 28 }}>
          <input name="q" aria-label="Bilim markazida qidirish" placeholder="Masalan: quloqda shovqin, audiometriya..." style={{ flex: 1, padding: "16px 18px", borderRadius: 14, border: "1px solid #bfd5c7", fontSize: 16 }} />
          <button className="primary" type="submit">Qidirish</button>
        </form>
      </section>

      <section style={{ marginBottom: 56 }}>
        <div className="section-heading"><div><p className="eyebrow">MAVZULAR</p><h2>Kerakli yo‘nalishni tanlang</h2></div></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 16 }}>
          {categories.map((category) => <Link key={category.id} href={`/foydali-malumotlar?category=${category.slug}`} style={{ padding: 24, border: "1px solid #dce8e0", borderRadius: 20, background: "white" }}><h3>{category.name}</h3><p>{category.description}</p><strong>Ko‘rish →</strong></Link>)}
          {!categories.length && <p>Bo‘limlar database migratsiyasidan keyin shu yerda ko‘rinadi.</p>}
        </div>
      </section>

      <section>
        <div className="section-heading"><div><p className="eyebrow">YANGI MAQOLALAR</p><h2>Foydali va amaliy qo‘llanmalar</h2></div><Link href="/savol-javob">Tez-tez beriladigan savollar →</Link></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
          {articles.map((article) => <article key={article.id} style={{ padding: 28, borderRadius: 22, border: "1px solid #dce8e0", background: "white" }}><small>{article.categoryName ?? "Foydali ma’lumot"} · {article.readingTimeMinutes} daqiqa</small><h3 style={{ fontSize: 25, margin: "12px 0" }}>{article.title}</h3><p style={{ lineHeight: 1.65 }}>{article.excerpt}</p><Link href={`/maqolalar/${article.slug}`}>Maqolani o‘qish →</Link></article>)}
          {!articles.length && <div style={{ padding: 28, borderRadius: 22, background: "#f4f8f5" }}><h3>Maqolalar tayyorlanmoqda</h3><p>Admin panelda tasdiqlanib nashr qilingan maqolalar avtomatik shu yerda chiqadi.</p></div>}
        </div>
      </section>
    </main>
  );
}
