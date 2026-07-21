"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";
const statuses = ["PENDING", "CONFIRMED", "CONTACTED", "ARRIVED", "NO_SHOW", "CANCELLED", "RESCHEDULED", "COMPLETED"];

type Appointment = {
  id: string;
  publicReference: string;
  startsAt: string;
  endsAt: string;
  status: string;
  contact: { name: string; displayPhone: string };
  branch: { name: string };
  service: { name: string };
  lead: { id: string; publicReference: string };
};

export default function AppointmentsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Appointment[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const token = typeof window === "undefined" ? "" : localStorage.getItem("soundz_admin_token") ?? "";

  async function load(): Promise<void> {
    if (!token) { router.replace("/login"); return; }
    const params = new URLSearchParams({ limit: "100" });
    if (status) params.set("status", status);
    setLoading(true);
    const response = await fetch(`${API_URL}/admin/appointments?${params}`, { headers: { authorization: `Bearer ${token}` } });
    if (response.status === 401) { router.replace("/login"); return; }
    const data = await response.json();
    setItems(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, [status]);

  async function changeStatus(id: string, nextStatus: string): Promise<void> {
    await fetch(`${API_URL}/admin/appointments/${id}/status`, {
      method: "PATCH",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: nextStatus }),
    });
    await load();
  }

  function logout(): void { localStorage.removeItem("soundz_admin_token"); router.push("/login"); }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="logo-row"><div className="brand-mark small">S</div><strong>Soundz</strong></div>
        <nav><Link href="/leads">Murojaatlar</Link><Link className="active" href="/appointments">Qabullar</Link><Link href="/settings/branches">Filiallar</Link><span className="disabled">Mahsulotlar</span></nav>
        <button className="ghost-button" onClick={logout}>Chiqish</button>
      </aside>
      <main className="admin-main">
        <header className="page-header"><div><p className="eyebrow">APPOINTMENTS</p><h1>Qabullar</h1><p>Oldindan yozilgan audiometriya va maslahat qabullari.</p></div></header>
        <section className="metrics"><article><span>Ko‘rsatilmoqda</span><strong>{items.length}</strong></article><article><span>Kutilmoqda</span><strong>{items.filter((x) => x.status === "PENDING").length}</strong></article><article><span>Tasdiqlangan</span><strong>{items.filter((x) => x.status === "CONFIRMED").length}</strong></article></section>
        <section className="panel">
          <div className="filters"><div></div><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Barcha statuslar</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></div>
          <div className="table-wrap"><table><thead><tr><th>Vaqt</th><th>Mijoz</th><th>Filial / xizmat</th><th>Status</th><th>Murojaat</th></tr></thead><tbody>
            {loading ? <tr><td colSpan={5}>Yuklanmoqda…</td></tr> : items.length === 0 ? <tr><td colSpan={5}>Qabullar topilmadi.</td></tr> : items.map((item) => <tr key={item.id}>
              <td><strong>{new Intl.DateTimeFormat("uz-UZ", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tashkent" }).format(new Date(item.startsAt))}</strong><small>{item.publicReference}</small></td>
              <td><strong>{item.contact.name}</strong><small>{item.contact.displayPhone}</small></td>
              <td><strong>{item.branch.name}</strong><small>{item.service.name}</small></td>
              <td><select className="table-select" value={item.status} onChange={(e) => void changeStatus(item.id, e.target.value)}>{statuses.map((value) => <option key={value}>{value}</option>)}</select></td>
              <td><Link className="text-link" href={`/leads/${item.lead.id}`}>{item.lead.publicReference} →</Link></td>
            </tr>)}</tbody></table></div>
        </section>
      </main>
    </div>
  );
}
