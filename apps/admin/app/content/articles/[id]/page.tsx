"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";
type Category = { id: string; name: string };
type Article = { id:string; title:string; slug:string; excerpt:string; content:string; categoryId?:string|null; locale:"uz"|"ru"; status:string; authorName?:string|null; reviewerName?:string|null; seoTitle?:string|null; seoDescription?:string|null; readingTimeMinutes:number; medicalDisclaimer?:string|null };

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const token = typeof window === "undefined" ? "" : localStorage.getItem("soundz_admin_token") ?? "";

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }
    Promise.all([
      fetch(`${API_URL}/admin/content/articles/${id}`, { headers: { authorization: `Bearer ${token}` } }).then(async r => { const d=await r.json(); if(!r.ok) throw new Error(d.message ?? "Maqola olinmadi"); return d; }),
      fetch(`${API_URL}/content/categories?locale=uz`).then(r => r.json()),
    ]).then(([item, cats]) => { setArticle(item); setCategories(Array.isArray(cats) ? cats : cats.items ?? []); }).catch(e => setFeedback(e instanceof Error ? e.message : "Ma’lumot olinmadi"));
  }, [id, router, token]);

  function field<K extends keyof Article>(key: K, value: Article[K]) { setArticle(current => current ? { ...current, [key]: value } : current); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!article) return; setSaving(true); setFeedback("");
    try {
      const response = await fetch(`${API_URL}/admin/content/articles/${id}`, { method:"PATCH", headers:{"content-type":"application/json",authorization:`Bearer ${token}`}, body:JSON.stringify(article) });
      const data = await response.json(); if(!response.ok) throw new Error(data.message ?? "Maqola saqlanmadi");
      setArticle(current => current ? { ...current, ...data } : current); setFeedback("O‘zgarishlar saqlandi.");
    } catch (e) { setFeedback(e instanceof Error ? e.message : "Maqola saqlanmadi"); } finally { setSaving(false); }
  }

  async function publish() {
    if (!article) return; setSaving(true); setFeedback("");
    try {
      const response = await fetch(`${API_URL}/admin/content/articles/${id}/status`, { method:"PATCH", headers:{"content-type":"application/json",authorization:`Bearer ${token}`}, body:JSON.stringify({status:"PUBLISHED"}) });
      const data=await response.json(); if(!response.ok) throw new Error(data.message ?? "Nashr qilinmadi");
      field("status","PUBLISHED"); setFeedback("Maqola nashr qilindi.");
    } catch(e) { setFeedback(e instanceof Error ? e.message : "Nashr qilinmadi"); } finally { setSaving(false); }
  }

  if (!article) return <main className="detail-loading">{feedback || "Yuklanmoqda…"}</main>;
  return <main className="editor-page">
    <div className="editor-topbar"><div><Link className="back-link" href="/content/articles">← Maqolalarga qaytish</Link><p className="eyebrow">KONTENT TAHRIRI</p><h1>{article.title}</h1></div><div className="editor-actions"><button className="outline-button" type="button" onClick={() => router.push(`/content/articles`)}>Bekor qilish</button><button className="outline-button" type="button" onClick={publish} disabled={saving || article.status === "PUBLISHED"}>Nashr qilish</button><button form="edit-article" className="primary-button" disabled={saving}>{saving ? "Saqlanmoqda…" : "Saqlash"}</button></div></div>
    {feedback && <p className={feedback.includes("saqlandi") || feedback.includes("nashr") ? "notice" : "error-message"}>{feedback}</p>}
    <form id="edit-article" className="editor-grid" onSubmit={submit}>
      <section className="panel editor-main"><label>Sarlavha<input value={article.title} onChange={e=>field("title",e.target.value)} required /></label><label>URL slug<input value={article.slug} onChange={e=>field("slug",e.target.value)} required /></label><label>Qisqa tavsif<textarea value={article.excerpt} onChange={e=>field("excerpt",e.target.value)} required /></label><label>Asosiy matn<textarea className="content-editor" value={article.content} onChange={e=>field("content",e.target.value)} required /></label><label>SEO sarlavha<input value={article.seoTitle ?? ""} onChange={e=>field("seoTitle",e.target.value)} /></label><label>SEO tavsif<textarea value={article.seoDescription ?? ""} onChange={e=>field("seoDescription",e.target.value)} /></label></section>
      <aside className="editor-sidebar"><section className="panel editor-card"><h2>Nashr sozlamalari</h2><label>Holat<select value={article.status} onChange={e=>field("status",e.target.value)}><option value="DRAFT">Qoralama</option><option value="IN_REVIEW">Tekshiruvda</option><option value="APPROVED">Tasdiqlangan</option><option value="PUBLISHED">Nashr qilingan</option><option value="NEEDS_UPDATE">Yangilash kerak</option><option value="ARCHIVED">Arxivlangan</option></select></label><label>Til<select value={article.locale} onChange={e=>field("locale",e.target.value as "uz"|"ru")}><option value="uz">O‘zbekcha</option><option value="ru">Ruscha</option></select></label><label>Kategoriya<select value={article.categoryId ?? ""} onChange={e=>field("categoryId",e.target.value || null)}><option value="">Tanlanmagan</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>O‘qish vaqti<input type="number" min={1} value={article.readingTimeMinutes} onChange={e=>field("readingTimeMinutes",Number(e.target.value))} /></label></section><section className="panel editor-card"><h2>Tekshiruv</h2><label>Muallif<input value={article.authorName ?? ""} onChange={e=>field("authorName",e.target.value)} /></label><label>Tibbiy tekshiruvchi<input value={article.reviewerName ?? ""} onChange={e=>field("reviewerName",e.target.value)} /></label><label>Ogohlantirish<textarea value={article.medicalDisclaimer ?? ""} onChange={e=>field("medicalDisclaimer",e.target.value)} /></label></section></aside>
    </form>
  </main>;
}