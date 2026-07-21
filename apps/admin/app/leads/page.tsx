"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

type Lead = {
  id: string;
  publicReference: string;
  type: string;
  status: string;
  createdAt: string;
  message?: string | null;
  contact: { name: string; displayPhone: string };
  branch?: { name: string } | null;
};

const statusLabels: Record<string, string> = {
  NEW: "Yangi",
  NEEDS_CONTACT: "Bog‘lanish kerak",
  CONTACTED: "Bog‘lanildi",
  APPOINTMENT_BOOKED: "Qabulga yozildi",
  FOLLOW_UP: "Keyin bog‘lanish",
  VISITED: "Filialga keldi",
  SALE_COMPLETED: "Sotuv bo‘ldi",
  CANCELLED: "Bekor qilindi",
  INVALID: "Noto‘g‘ri",
};

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const token = typeof window === "undefined" ? "" : localStorage.getItem("soundz_admin_token") ?? "";

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }
    const params = new URLSearchParams({ limit: "50" });
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    setLoading(true);
    fetch(`${API_URL}/admin/leads?${params}`, { headers: { authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (response.status === 401) { localStorage.removeItem("soundz_admin_token"); router.replace("/login"); throw new Error("Sessiya tugagan"); }
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "Ma’lumot olinmadi");
        setLeads(data.items ?? []); setTotal(data.total ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router, search, status, token]);

  const newCount = useMemo(() => leads.filter((lead) => lead.status === "NEW").length, [leads]);

  function logout() { localStorage.removeItem("soundz_admin_token"); router.push("/login"); }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="logo-row"><div className="brand-mark small">S</div><strong>Soundz</strong></div>
        <nav><Link className="active" href="/leads">Murojaatlar</Link><Link href="/appointments">Qabullar</Link><Link href="/settings/branches">Filiallar</Link><span className="disabled">Mahsulotlar</span></nav>
        <button className="ghost-button" onClick={logout}>Chiqish</button>
      </aside>
      <main className="admin-main">
        <header className="page-header"><div><p className="eyebrow">CRM-LITE</p><h1>Murojaatlar</h1><p>Saytdan kelgan barcha mijoz so‘rovlari.</p></div><div className="live-pill"><span /> Jonli tizim</div></header>
        <section className="metrics">
          <article><span>Jami</span><strong>{total}</strong></article>
          <article><span>Yangi</span><strong>{newCount}</strong></article>
          <article><span>Ko‘rsatilmoqda</span><strong>{leads.length}</strong></article>
        </section>
        <section className="panel">
          <div className="filters">
            <input placeholder="Ism, telefon yoki murojaat raqami" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Barcha statuslar</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          </div>
          <div className="table-wrap">
            <table><thead><tr><th>Mijoz</th><th>Yo‘nalish</th><th>Filial</th><th>Status</th><th>Kelgan vaqt</th></tr></thead>
              <tbody>{loading ? <tr><td colSpan={5}>Yuklanmoqda…</td></tr> : leads.length === 0 ? <tr><td colSpan={5}>Murojaatlar topilmadi.</td></tr> : leads.map((lead) => (
                <tr key={lead.id}>
                  <td><Link href={`/leads/${lead.id}`}><strong>{lead.contact.name}</strong><small>{lead.contact.displayPhone} · {lead.publicReference}</small></Link></td>
                  <td>{lead.type.replaceAll("_", " ")}</td><td>{lead.branch?.name ?? "Belgilanmagan"}</td>
                  <td><span className={`status status-${lead.status.toLowerCase()}`}>{statusLabels[lead.status] ?? lead.status}</span></td>
                  <td>{new Intl.DateTimeFormat("uz-UZ", { dateStyle: "short", timeStyle: "short" }).format(new Date(lead.createdAt))}</td>
                </tr>))}</tbody></table>
          </div>
        </section>
      </main>
    </div>
  );
}
