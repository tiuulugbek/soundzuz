"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

type Category = { id: string; name: string; slug: string };

export default function NewArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [locale, setLocale] = useState<"uz" | "ru">("uz");
  const [status, setStatus] = useState("DRAFT");
  const [authorName, setAuthorName] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [readingTimeMinutes, setReadingTimeMinutes] = useState(5);
  const [medicalDisclaimer, setMedicalDisclaimer] = useState("Ushbu ma’lumot umumiy tushuntirish uchun berilgan va individual tibbiy tashxis o‘rnini bosmaydi.");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const token = typeof window === "undefined" ? "" : localStorage.getItem("soundz_admin_token") ?? "";

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }
    fetch(`${API_URL}/content/categories?locale=${locale}`)
      .then((response) => response.json())
      .then((data) => setCategories(Array.isArray(data) ? data : data.items ?? []))
      .catch(() => setCategories([]));
  }, [locale, router, token]);

  function updateSlug(value: string) {
    setTitle(value);
    setSlug(value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setFeedback("");
    try {
      const response = await fetch(`${API_URL}/admin/content/articles`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, slug, excerpt, content, categoryId: categoryId || undefined, locale, status, authorName: authorName || undefined, reviewerName: reviewerName || undefined, seoTitle: seoTitle || undefined, seoDescription: seoDescription || undefined, readingTimeMinutes, medicalDisclaimer }),
      });
      const data = await response.json();
      if (response.status === 401) { localStorage.removeItem("soundz_admin_token"); router.replace("/login"); throw new Error("Sessiya tugagan"); }
      if (!response.ok) throw new Error(data.message ?? "Maqola saqlanmadi");
      setFeedback("Maqola muvaffaqiyatli saqlandi.");
      setTimeout(() => router.push("/content/articles"), 500);
    } catch (reason) { setFeedback(reason instanceof Error ? reason.message : "Maqola saqlanmadi"); }
    finally { setLoading(false); }
  }

  return <main className="editor-page">
    <div className="editor-topbar"><div><Link className="back-link" href="/content/articles">← Maqolalarga qaytish</Link><p className="eyebrow">YANGI KONTENT</p><h1>Yangi maqola</h1></div><div className="editor-actions"><button form="article-form" name="status" value="DRAFT" className="outline-button" type="submit" disabled={loading}>Qoralama saqlash</button><button form="article-form" className="primary-button" disabled={loading}>{loading ? "Saqlanmoqda…" : "Saqlash"}</button></div></div>
    {feedback && <p className={feedback.includes("muvaffaqiyatli") ? "notice" : "error-message"}>{feedback}</p>}
    <form id="article-form" className="editor-grid" onSubmit={submit}>
      <section className="panel editor-main"><label>Sarlavha<input value={title} onChange={(event) => updateSlug(event.target.value)} required /></label><label>URL slug<input value={slug} onChange={(event) => setSlug(event.target.value)} required pattern="[a-z0-9-]+" /></label><label>Qisqa tavsif<textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} required minLength={40} /></label><label>Asosiy matn<textarea className="content-editor" value={content} onChange={(event) => setContent(event.target.value)} required minLength={200} placeholder="Maqola matnini kiriting. Hozircha oddiy matn/HTML; keyingi bosqichda rich-text editor qo‘shiladi." /></label><label>SEO sarlavha<input value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} maxLength={70} /></label><label>SEO tavsif<textarea value={seoDescription} onChange={(event) => setSeoDescription(event.target.value)} maxLength={170} /></label></section>
      <aside className="editor-sidebar"><section className="panel editor-card"><h2>Nashr sozlamalari</h2><label>Til<select value={locale} onChange={(event) => setLocale(event.target.value as "uz" | "ru")}><option value="uz">O‘zbekcha</option><option value="ru">Ruscha</option></select></label><label>Holat<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="DRAFT">Qoralama</option><option value="IN_REVIEW">Tekshiruvda</option><option value="APPROVED">Tasdiqlangan</option><option value="PUBLISHED">Nashr qilingan</option></select></label><label>Kategoriya<select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Kategoriya tanlanmagan</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>O‘qish vaqti<input type="number" min={1} max={60} value={readingTimeMinutes} onChange={(event) => setReadingTimeMinutes(Number(event.target.value))} /></label></section><section className="panel editor-card"><h2>Muallif va tekshiruv</h2><label>Muallif<input value={authorName} onChange={(event) => setAuthorName(event.target.value)} /></label><label>Tibbiy tekshiruvchi<input value={reviewerName} onChange={(event) => setReviewerName(event.target.value)} /></label><label>Tibbiy ogohlantirish<textarea value={medicalDisclaimer} onChange={(event) => setMedicalDisclaimer(event.target.value)} /></label></section></aside>
    </form>
  </main>;
}
