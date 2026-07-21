"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";
const statuses = ["NEW", "NEEDS_CONTACT", "CONTACTED", "APPOINTMENT_BOOKED", "FOLLOW_UP", "VISITED", "SALE_COMPLETED", "CANCELLED", "INVALID"];

type Detail = {
  id: string; publicReference: string; status: string; type: string; message?: string | null; createdAt: string;
  contact: { name: string; displayPhone: string; normalizedPhone: string };
  branch?: { name: string } | null;
  notes: Array<{ id: string; body: string; createdAt: string; author: { firstName: string } }>;
  statusHistory: Array<{ id: string; fromStatus?: string | null; toStatus: string; createdAt: string; note?: string | null }>;
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>(); const router = useRouter();
  const [lead, setLead] = useState<Detail | null>(null); const [note, setNote] = useState(""); const [busy, setBusy] = useState(false);
  const token = typeof window === "undefined" ? "" : localStorage.getItem("soundz_admin_token") ?? "";
  const load = useCallback(async () => {
    if (!token) { router.replace("/login"); return; }
    const response = await fetch(`${API_URL}/admin/leads/${id}`, { headers: { authorization: `Bearer ${token}` } });
    if (response.status === 401) { router.replace("/login"); return; }
    setLead(await response.json());
  }, [id, router, token]);
  useEffect(() => { void load(); }, [load]);

  async function changeStatus(status: string) {
    setBusy(true); await fetch(`${API_URL}/admin/leads/${id}/status`, { method: "PATCH", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) }); await load(); setBusy(false);
  }
  async function addNote(event: FormEvent) {
    event.preventDefault(); if (!note.trim()) return; setBusy(true); await fetch(`${API_URL}/admin/leads/${id}/notes`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify({ body: note }) }); setNote(""); await load(); setBusy(false);
  }
  if (!lead) return <main className="detail-loading">Yuklanmoqda…</main>;
  return <main className="detail-page">
    <Link className="back-link" href="/leads">← Murojaatlarga qaytish</Link>
    <header className="detail-header"><div><p className="eyebrow">{lead.publicReference}</p><h1>{lead.contact.name}</h1><a href={`tel:+${lead.contact.normalizedPhone}`}>{lead.contact.displayPhone}</a></div><span className={`status status-${lead.status.toLowerCase()}`}>{lead.status}</span></header>
    <div className="detail-grid"><section className="panel detail-card"><h2>Murojaat</h2><dl><div><dt>Yo‘nalish</dt><dd>{lead.type.replaceAll("_", " ")}</dd></div><div><dt>Filial</dt><dd>{lead.branch?.name ?? "Belgilanmagan"}</dd></div><div><dt>Izoh</dt><dd>{lead.message ?? "Izoh yo‘q"}</dd></div><div><dt>Kelgan vaqt</dt><dd>{new Date(lead.createdAt).toLocaleString("uz-UZ")}</dd></div></dl><h3>Statusni o‘zgartirish</h3><select disabled={busy} value={lead.status} onChange={(e) => void changeStatus(e.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></section>
      <section className="panel detail-card"><h2>Ichki izohlar</h2><form onSubmit={addNote}><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Operator izohini yozing…"/><button className="primary-button" disabled={busy}>Izoh qo‘shish</button></form><div className="timeline">{lead.notes.map((item) => <article key={item.id}><strong>{item.author.firstName}</strong><p>{item.body}</p><small>{new Date(item.createdAt).toLocaleString("uz-UZ")}</small></article>)}</div></section>
      <section className="panel detail-card full"><h2>Status tarixi</h2><div className="timeline horizontal">{lead.statusHistory.map((item) => <article key={item.id}><strong>{item.fromStatus ?? "START"} → {item.toStatus}</strong><p>{item.note ?? ""}</p><small>{new Date(item.createdAt).toLocaleString("uz-UZ")}</small></article>)}</div></section>
    </div>
  </main>;
}
