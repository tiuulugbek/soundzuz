"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

type Article = {
  id: string;
  slug: string;
  locale: "uz" | "ru";
  title: string;
  status: string;
  categoryName?: string | null;
  updatedAt: string;
};

const statusLabels: Record<string, string> = {
  DRAFT: "Qoralama",
  IN_REVIEW: "Tekshiruvda",
  APPROVED: "Tasdiqlangan",
  PUBLISHED: "Nashr qilingan",
  NEEDS_UPDATE: "Yangilash kerak",
  ARCHIVED: "Arxivlangan",
};

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = typeof window === "undefined" ? "" : localStorage.getItem("soundz_admin_token") ?? "";

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }
    setLoading(true);
    fetch(`${API_URL}/admin/content/articles`, { headers: { authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (response.status === 401) { localStorage.removeItem("soundz_admin_token"); router.replace("/login"); throw new Error("Sessiya tugagan"); }
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "Maqolalar olinmadi");
        setArticles(Array.isArray(data) ? data : data.items ?? []);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Maqolalar olinmadi"))
      .finally(() => setLoading(false));
  }, [router, token]);

  const filtered = useMemo(() => articles.filter((article) => {
    const matchesSearch = !search || `${article.title} ${article.slug} ${article.categoryName ?? ""}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !status || article.status === status;
    return matchesSearch && matchesStatus;
  }), [articles, search, status]);

  const published = articles.filter((article) => article.status === "PUBLISHED").length;
  const review = articles.filter((article) => article.status === "IN_REVIEW").length;

  function logout() { localStorage.removeItem("soundz_admin_token"); router.push("/login"); }

  return <div className="admin-shell">
    <aside className="sidebar">
      <div className="logo-row"><div className="brand-mark small">S</div><strong>Soundz</strong></div>
      <nav><Link href="/leads">Murojaatlar</Link><Link href="/appointments">Qabullar</Link><Link href="/settings/branches">Filiallar</Link><Link className="active" href="/content/articles">Kontent</Link><span className="disabled">Mahsulotlar</span></nav>
      <button className="ghost-button" onClick={logout}>Chiqish</button>
    </aside>
    <main className="admin-main">
      <header className="page-header"><div><p className="eyebrow">BILIM MARKAZI</p><h1>Maqolalar</h1><p>Eshitish salomatligi bo‘yicha materiallarni boshqaring.</p></div><Link className="primary-button" href="/content/articles/new">+ Yangi maqola</Link></header>
      <section className="metrics"><article><span>Jami</span><strong>{articles.length}</strong></article><article><span>Nashr qilingan</span><strong>{published}</strong></article><article><span>Tekshiruvda</span><strong>{review}</strong></article></section>
      {error && <p className="error-message">{error}</p>}
      <section className="panel">
        <div className="filters"><input placeholder="Sarlavha, slug yoki kategoriya" value={search} onChange={(event) => setSearch(event.target.value)} /><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Barcha holatlar</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <div className="table-wrap"><table><thead><tr><th>Maqola</th><th>Kategoriya</th><th>Til</th><th>Holat</th><th>Yangilangan</th></tr></thead><tbody>
          {loading ? <tr><td colSpan={5}>Yuklanmoqda…</td></tr> : filtered.length === 0 ? <tr><td colSpan={5}>Maqola topilmadi.</td></tr> : filtered.map((article) => <tr key={article.id}><td><strong>{article.title}</strong><small>/{article.slug}</small></td><td>{article.categoryName ?? "Belgilanmagan"}</td><td>{article.locale.toUpperCase()}</td><td><span className={`status content-status-${article.status.toLowerCase()}`}>{statusLabels[article.status] ?? article.status}</span></td><td>{new Intl.DateTimeFormat("uz-UZ", { dateStyle: "short", timeStyle: "short" }).format(new Date(article.updatedAt))}</td></tr>)}
        </tbody></table></div>
      </section>
    </main>
  </div>;
}
