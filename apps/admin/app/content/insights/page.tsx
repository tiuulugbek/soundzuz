"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "../../components/AdminSidebar";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

type Search = { query: string; count: number; unanswered: number };
type Viewed = { id: string; title: string; slug: string; locale: string; views: number };
type Feedback = { helpful: number; notHelpful: number; total: number };

const EMPTY_FEEDBACK: Feedback = { helpful: 0, notHelpful: 0, total: 0 };

/**
 * Kontent analitikasi — oxirgi 90 kun. Manba: `search_queries`, `content_views`
 * va `content_feedback` jadvallari (Content Hub v2).
 *
 * Javobsiz qolgan qidiruvlar eng qimmatli signal: ular saytda yetishmayotgan
 * mavzularni ko'rsatadi, ya'ni keyingi maqola nima haqida bo'lishi kerakligini.
 */
export default function ContentInsightsPage() {
  const router = useRouter();
  const [topSearches, setTopSearches] = useState<Search[]>([]);
  const [topViewed, setTopViewed] = useState<Viewed[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(EMPTY_FEEDBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = typeof window === "undefined" ? "" : localStorage.getItem("soundz_admin_token") ?? "";

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }
    fetch(`${API_URL}/admin/content/insights`, { headers: { authorization: `Bearer ${token}` } })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.message ?? "Ma’lumot olinmadi");
        setTopSearches(Array.isArray(d.topSearches) ? d.topSearches : []);
        setTopViewed(Array.isArray(d.topViewed) ? d.topViewed : []);
        setFeedback(d.feedback ?? EMPTY_FEEDBACK);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Xatolik"))
      .finally(() => setLoading(false));
  }, [router, token]);

  const helpfulPercent = feedback.total > 0 ? Math.round((feedback.helpful / feedback.total) * 100) : null;

  return (
    <div className="admin-shell">
      <AdminSidebar />

      <main className="admin-main">
        <header className="page-header">
          <div>
            <p className="eyebrow">KONTENT ANALITIKASI</p>
            <h1>Analitika</h1>
            <p>Oxirgi 90 kun: odamlar nima qidirmoqda, nimani o‘qimoqda va kontent foydali bo‘ldimi.</p>
          </div>
        </header>

        {error && <p className="error-message">{error}</p>}
        {loading ? (
          <p className="helper">Yuklanmoqda…</p>
        ) : (
          <>
            <div className="metrics">
              <article>
                <span>Foydali deb baholangan</span>
                <strong>{helpfulPercent === null ? "—" : `${helpfulPercent}%`}</strong>
              </article>
              <article>
                <span>Jami baholar</span>
                <strong>{feedback.total}</strong>
              </article>
              <article>
                <span>Foydasiz deb baholangan</span>
                <strong>{feedback.notHelpful}</strong>
              </article>
            </div>

            <section className="settings-grid">
              <article className="panel settings-card">
                <h2>Eng ko‘p qidirilgan</h2>
                {topSearches.length === 0 ? (
                  <p className="helper">Hali qidiruv yozilmagan. Saytdagi qidiruvdan foydalanilgach shu yerda ko‘rinadi.</p>
                ) : (
                  <div className="category-list">
                    {topSearches.map((s) => (
                      <div key={s.query}>
                        <div>
                          <strong>{s.query}</strong>
                          <small>{s.count} marta{s.unanswered > 0 ? ` · ${s.unanswered} marta javobsiz` : ""}</small>
                        </div>
                        {s.unanswered > 0 ? (
                          <span className="status content-status-needs_update">Kontent kerak</span>
                        ) : (
                          <span className="status content-status-published">Javob bor</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </article>

              <article className="panel settings-card">
                <h2>Eng ko‘p o‘qilgan maqolalar</h2>
                {topViewed.length === 0 ? (
                  <p className="helper">Hali ko‘rish yozilmagan.</p>
                ) : (
                  <div className="category-list">
                    {topViewed.map((v) => (
                      <div key={`${v.id}-${v.locale}`}>
                        <div>
                          <strong>{v.title}</strong>
                          <small>{v.locale.toUpperCase()} · /{v.slug}</small>
                        </div>
                        <span className="status content-status-published">{v.views}</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
