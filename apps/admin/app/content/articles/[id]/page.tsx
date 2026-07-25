"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { MediaPicker } from "../../../components/MediaPicker";
import { RichTextEditor } from "../../../components/RichTextEditor";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";
const statuses = [
  ["DRAFT", "Qoralama"],
  ["IN_REVIEW", "Tekshiruvda"],
  ["APPROVED", "Tasdiqlangan"],
  ["PUBLISHED", "Nashr qilingan"],
  ["NEEDS_UPDATE", "Yangilash kerak"],
  ["ARCHIVED", "Arxivlangan"],
];
const LOCALES = ["uz", "ru", "en"];

type Form = {
  slug: string; locale: string; categoryId: string; title: string; excerpt: string; content: string;
  status: string; featuredImageUrl: string; authorName: string; reviewerName: string;
  seoTitle: string; seoDescription: string; readingTimeMinutes: number; medicalDisclaimer: string;
  tags: string; relatedProducts: string[];
};
const empty: Form = {
  slug: "", locale: "uz", categoryId: "", title: "", excerpt: "", content: "", status: "DRAFT",
  featuredImageUrl: "", authorName: "", reviewerName: "", seoTitle: "", seoDescription: "",
  readingTimeMinutes: 5,
  medicalDisclaimer: "Ushbu ma’lumot umumiy tushuntirish uchun berilgan va individual tibbiy tashxis o‘rnini bosmaydi.",
  tags: "", relatedProducts: [],
};

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<Form>(empty);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<Array<{ slug: string; name: string; brand?: string }>>([]);
  const [translations, setTranslations] = useState<Array<{ locale: string; status: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const token = typeof window === "undefined" ? "" : localStorage.getItem("soundz_admin_token") ?? "";

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }
    const auth = { authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_URL}/admin/content/articles/${id}`, { headers: auth }),
      fetch(`${API_URL}/content/categories?locale=uz`),
      fetch(`${API_URL}/admin/catalog/products`, { headers: auth }),
      fetch(`${API_URL}/admin/content/articles`, { headers: auth }),
    ]).then(async ([a, c, p, list]) => {
      const ad = await a.json();
      if (!a.ok) throw new Error(ad.message ?? "Maqola olinmadi");
      const cd = await c.json();
      const pd = p.ok ? await p.json() : [];
      const ld = list.ok ? await list.json() : [];
      setForm({
        ...empty, ...ad,
        categoryId: ad.categoryId ?? "", featuredImageUrl: ad.featuredImageUrl ?? "",
        authorName: ad.authorName ?? "", reviewerName: ad.reviewerName ?? "",
        seoTitle: ad.seoTitle ?? "", seoDescription: ad.seoDescription ?? "",
        medicalDisclaimer: ad.medicalDisclaimer ?? empty.medicalDisclaimer,
        tags: Array.isArray(ad.tags) ? ad.tags.join(", ") : "",
        relatedProducts: Array.isArray(ad.relatedProducts) ? ad.relatedProducts : [],
      });
      setCategories(Array.isArray(cd) ? cd : cd.items ?? []);
      const prodItems = Array.isArray(pd) ? pd : pd.items ?? [];
      const bySlug = new Map<string, { slug: string; name: string; brand?: string }>();
      for (const it of prodItems) if (it?.slug && !bySlug.has(it.slug)) bySlug.set(it.slug, { slug: it.slug, name: it.name, brand: it.brand });
      setProducts(Array.from(bySlug.values()));
      const listItems = Array.isArray(ld) ? ld : ld.items ?? [];
      setTranslations(listItems.filter((x: any) => x.slug === ad.slug).map((x: any) => ({ locale: x.locale, status: x.status })));
    }).catch((e) => setError(e instanceof Error ? e.message : "Xatolik")).finally(() => setLoading(false));
  }, [id, router, token]);

  function set<K extends keyof Form>(k: K, v: Form[K]) { setForm((s) => ({ ...s, [k]: v })); }
  function toggleProduct(slug: string) {
    setForm((s) => ({ ...s, relatedProducts: s.relatedProducts.includes(slug) ? s.relatedProducts.filter((x) => x !== slug) : [...s.relatedProducts, slug] }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true); setError(""); setMessage("");
    try {
      const r = await fetch(`${API_URL}/admin/content/articles/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          categoryId: form.categoryId || null,
          featuredImageUrl: form.featuredImageUrl || null,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          relatedProducts: form.relatedProducts,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message ?? "Saqlanmadi");
      setMessage(form.status === "PUBLISHED" ? "Maqola nashr qilindi." : "O‘zgarishlar saqlandi.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Saqlanmadi");
    } finally { setSaving(false); }
  }

  if (loading) return <main className="detail-loading">Yuklanmoqda…</main>;

  return (
    <main className="detail-page">
      <Link className="back-link" href="/content/articles">← Maqolalarga qaytish</Link>
      <header className="detail-header">
        <div><p className="eyebrow">KONTENT WORKFLOW</p><h1>Maqolani tahrirlash</h1></div>
        <div className="editor-actions">
          <Link className="outline-button" href="/content/faqs">FAQ bog‘lash</Link>
          <Link className="outline-button" href="/content/media">Media Library</Link>
          <Link className="outline-button" href="/content/categories">Kategoriyalar</Link>
          <a href={`/maqolalar/${form.slug}`} target="_blank" rel="noreferrer">Public sahifani ko‘rish ↗</a>
        </div>
      </header>
      <div className="translation-status">
        <span className="translation-status__label">Tarjima holati:</span>
        {LOCALES.map((loc) => {
          const tr = translations.find((x) => x.locale === loc);
          const cls = tr ? (tr.status === "PUBLISHED" ? "is-published" : "is-draft") : "is-missing";
          return <span key={loc} className={`translation-badge ${cls}`}>{loc.toUpperCase()}: {tr ? (tr.status === "PUBLISHED" ? "nashr" : "tayyorlanmoqda") : "yo‘q"}</span>;
        })}
      </div>
      {error && <p className="error-message">{error}</p>}
      {message && <p className="notice">{message}</p>}
      <form className="editor-form" onSubmit={submit}>
        <section className="panel editor-card">
          <div className="editor-grid">
            <label className="wide">Sarlavha<input value={form.title} onChange={(e) => set("title", e.target.value)} required /></label>
            <label>Slug<input value={form.slug} onChange={(e) => set("slug", e.target.value)} required /></label>
            <label>Til<select value={form.locale} onChange={(e) => set("locale", e.target.value)}><option value="uz">O‘zbek</option><option value="ru">Rus</option><option value="en">Ingliz</option></select></label>
            <label>Kategoriya<select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}><option value="">Tanlanmagan</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <label>Holat<select value={form.status} onChange={(e) => set("status", e.target.value)}>{statuses.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            <div className="wide"><MediaPicker entityType="article" entityId={id} slot="featured" recommended="1600 × 900 (karta uchun 640 × 420 avtomatik)" value={form.featuredImageUrl} onChange={(url) => set("featuredImageUrl", url)} /></div>
            <label className="wide">Qisqa tavsif<textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} required /></label>
            <div className="wide">
              <span className="field-label">Asosiy matn</span>
              <RichTextEditor value={form.content} onChange={(html) => set("content", html)} />
              <p className="helper">H2 va H3 sarlavhalari public sahifada avtomatik mundarijaga aylanadi.</p>
            </div>
            <label>Muallif<input value={form.authorName} onChange={(e) => set("authorName", e.target.value)} /></label>
            <label>Tekshiruvchi (tibbiy)<input value={form.reviewerName} onChange={(e) => set("reviewerName", e.target.value)} /></label>
            <label>O‘qish vaqti<input type="number" min={1} value={form.readingTimeMinutes} onChange={(e) => set("readingTimeMinutes", Number(e.target.value))} /></label>
            <label className="wide">Teglar (vergul bilan)<input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="masalan: eshitish testi, RIC, bolalar" /></label>
            <div className="wide">
              <span className="field-label">Tegishli moslamalar</span>
              {products.length === 0 ? (
                <p className="helper">Katalog mahsulotlari topilmadi.</p>
              ) : (
                <div className="related-grid">
                  {products.map((p) => (
                    <label key={p.slug} className="related-check">
                      <input type="checkbox" checked={form.relatedProducts.includes(p.slug)} onChange={() => toggleProduct(p.slug)} />
                      <span>{p.name}{p.brand ? ` · ${p.brand}` : ""}</span>
                    </label>
                  ))}
                </div>
              )}
              <p className="helper">Maqola oxirida ko‘rsatiladigan mahsulotlar (maqola tili bo‘yicha aniqlanadi).</p>
            </div>
            <label className="wide">SEO title<input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} /></label>
            <label className="wide">SEO description<textarea value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} /></label>
            <label className="wide">Tibbiy ogohlantirish<textarea value={form.medicalDisclaimer} onChange={(e) => set("medicalDisclaimer", e.target.value)} /></label>
          </div>
          <div className="editor-actions">
            <Link className="outline-button" href="/content/articles">Bekor qilish</Link>
            <button className="primary-button" disabled={saving}>{saving ? "Saqlanmoqda…" : "Saqlash"}</button>
          </div>
        </section>
      </form>
    </main>
  );
}
