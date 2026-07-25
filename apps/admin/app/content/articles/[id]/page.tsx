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

/** Saytdagi public URL — uz prefikssiz, ru/en prefiksli (web bilan bir xil qoida). */
function publicArticleHref(locale: string, categorySlug: string, slug: string): string {
  const prefix = locale === "uz" ? "" : `/${locale}`;
  return `${prefix}/learn/${categorySlug}/${slug}`;
}

/** `2026-07-25T…` → `2026-07-25` (date input uchun). Bo'sh qiymatlarga bardoshli. */
function toDateInput(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

type Form = {
  slug: string; locale: string; categoryId: string; title: string; excerpt: string; content: string;
  status: string; featuredImageUrl: string; videoUrl: string; authorName: string; reviewerName: string;
  seoTitle: string; seoDescription: string; readingTimeMinutes: number; medicalDisclaimer: string;
  lastReviewedAt: string; nextReviewAt: string;
  tags: string; relatedProducts: string[]; relatedServices: string[];
};
const empty: Form = {
  slug: "", locale: "uz", categoryId: "", title: "", excerpt: "", content: "", status: "DRAFT",
  featuredImageUrl: "", videoUrl: "", authorName: "", reviewerName: "", seoTitle: "", seoDescription: "",
  readingTimeMinutes: 5,
  medicalDisclaimer: "Ushbu ma’lumot umumiy tushuntirish uchun berilgan va individual tibbiy tashxis o‘rnini bosmaydi.",
  lastReviewedAt: "", nextReviewAt: "",
  tags: "", relatedProducts: [], relatedServices: [],
};

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<Form>(empty);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<Array<{ slug: string; name: string; brand?: string }>>([]);
  const [services, setServices] = useState<Array<{ code: string; name: string }>>([]);
  const [translations, setTranslations] = useState<Array<{ locale: string; status: string }>>([]);
  const [revisions, setRevisions] = useState<Array<{ id: string; editor: string | null; createdAt: string }>>([]);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
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
      fetch(`${API_URL}/admin/catalog/products`, { headers: auth }),
      fetch(`${API_URL}/admin/content/articles`, { headers: auth }),
      fetch(`${API_URL}/locations/services`),
      fetch(`${API_URL}/admin/content/articles/${id}/revisions`, { headers: auth }),
    ]).then(async ([a, p, list, s, rev]) => {
      const ad = await a.json();
      if (!a.ok) throw new Error(ad.message ?? "Maqola olinmadi");
      const pd = p.ok ? await p.json() : [];
      const ld = list.ok ? await list.json() : [];
      const sd = s.ok ? await s.json() : [];
      const rd = rev.ok ? await rev.json() : [];
      setForm({
        ...empty, ...ad,
        categoryId: ad.categoryId ?? "", featuredImageUrl: ad.featuredImageUrl ?? "",
        videoUrl: ad.videoUrl ?? "",
        authorName: ad.authorName ?? "", reviewerName: ad.reviewerName ?? "",
        seoTitle: ad.seoTitle ?? "", seoDescription: ad.seoDescription ?? "",
        medicalDisclaimer: ad.medicalDisclaimer ?? empty.medicalDisclaimer,
        lastReviewedAt: toDateInput(ad.lastReviewedAt),
        nextReviewAt: toDateInput(ad.nextReviewAt),
        tags: Array.isArray(ad.tags) ? ad.tags.join(", ") : "",
        relatedProducts: Array.isArray(ad.relatedProducts) ? ad.relatedProducts : [],
        relatedServices: Array.isArray(ad.relatedServices) ? ad.relatedServices : [],
      });
      setPublishedAt(ad.publishedAt ?? null);
      const prodItems = Array.isArray(pd) ? pd : pd.items ?? [];
      const bySlug = new Map<string, { slug: string; name: string; brand?: string }>();
      for (const it of prodItems) if (it?.slug && !bySlug.has(it.slug)) bySlug.set(it.slug, { slug: it.slug, name: it.name, brand: it.brand });
      setProducts(Array.from(bySlug.values()));
      setServices((Array.isArray(sd) ? sd : sd.items ?? []).map((x: any) => ({ code: x.code, name: x.name ?? x.code })));
      setRevisions(Array.isArray(rd) ? rd : []);
      const listItems = Array.isArray(ld) ? ld : ld.items ?? [];
      setTranslations(listItems.filter((x: any) => x.slug === ad.slug).map((x: any) => ({ locale: x.locale, status: x.status })));
    }).catch((e) => setError(e instanceof Error ? e.message : "Xatolik")).finally(() => setLoading(false));
  }, [id, router, token]);

  // Kategoriyalar HAR LOCALE uchun alohida qatorlar — maqola tili o'zgarsa qayta olinadi,
  // aks holda ru/en maqolada kategoriya ro'yxati bo'sh yoki noto'g'ri chiqadi.
  //
  // Public endpoint EMAS, admin endpoint: publicda maqolasi yo'q kategoriya
  // ko'rsatilmaydi, admin esa yangi (hali bo'sh) kategoriyani tanlay olishi kerak.
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/admin/content/categories/articles`, { headers: { authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (cancelled) return;
        const all = Array.isArray(d) ? d : d.items ?? [];
        setCategories(all.filter((c: any) => c.locale === form.locale));
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [form.locale, token]);

  function set<K extends keyof Form>(k: K, v: Form[K]) { setForm((s) => ({ ...s, [k]: v })); }
  function toggleProduct(slug: string) {
    setForm((s) => ({ ...s, relatedProducts: s.relatedProducts.includes(slug) ? s.relatedProducts.filter((x) => x !== slug) : [...s.relatedProducts, slug] }));
  }
  function toggleService(code: string) {
    setForm((s) => ({ ...s, relatedServices: s.relatedServices.includes(code) ? s.relatedServices.filter((x) => x !== code) : [...s.relatedServices, code] }));
  }

  const categorySlug = categories.find((c) => c.id === form.categoryId)?.slug ?? "";

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
          videoUrl: form.videoUrl || null,
          lastReviewedAt: form.lastReviewedAt || null,
          nextReviewAt: form.nextReviewAt || null,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          relatedProducts: form.relatedProducts,
          relatedServices: form.relatedServices,
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
          {categorySlug ? (
            <a href={publicArticleHref(form.locale, categorySlug, form.slug)} target="_blank" rel="noreferrer">
              Public sahifani ko‘rish ↗
            </a>
          ) : (
            <span className="helper">Public havola uchun kategoriya tanlang</span>
          )}
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
            <div className="wide">
              <span className="field-label">Tegishli xizmatlar</span>
              {services.length === 0 ? (
                <p className="helper">Hali xizmat kiritilmagan — Sozlamalar → Filiallar/Xizmatlar bo‘limidan qo‘shiladi.</p>
              ) : (
                <div className="related-grid">
                  {services.map((s) => (
                    <label key={s.code} className="related-check">
                      <input type="checkbox" checked={form.relatedServices.includes(s.code)} onChange={() => toggleService(s.code)} />
                      <span>{s.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <label className="wide">Video havolasi<input value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://www.youtube.com/watch?v=…" /></label>
            <label>Oxirgi tibbiy tekshiruv<input type="date" value={form.lastReviewedAt} onChange={(e) => set("lastReviewedAt", e.target.value)} /></label>
            <label>Keyingi tekshiruv sanasi<input type="date" value={form.nextReviewAt} onChange={(e) => set("nextReviewAt", e.target.value)} /></label>
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

      <section className="panel editor-card">
        <h2>Tahrir tarixi</h2>
        {publishedAt ? (
          <p className="helper">Birinchi nashr: {new Date(publishedAt).toLocaleString("uz-UZ")}</p>
        ) : (
          <p className="helper">Hali nashr qilinmagan.</p>
        )}
        {revisions.length === 0 ? (
          <p className="helper">Saqlangan versiya yo‘q — birinchi tahrirdan keyin shu yerda ko‘rinadi.</p>
        ) : (
          <ul className="revision-list">
            {revisions.map((r) => (
              <li key={r.id}>
                <span>{new Date(r.createdAt).toLocaleString("uz-UZ")}</span>
                <span className="helper">{r.editor ?? "noma’lum muharrir"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
