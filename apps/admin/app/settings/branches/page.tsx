"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";
type Service = { id: string; code: string; name: string; durationMinutes: number; isActive: boolean };
type Branch = { id: string; name: string; slug: string; phone?: string | null; address?: string | null; isActive: boolean; services: Array<{ serviceId: string; isActive: boolean; service: Service }>; schedules: Array<{ weekday: number; openMinute: number; closeMinute: number; isClosed: boolean }> };

const weekdays = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

export default function BranchSettingsPage() {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]); const [services, setServices] = useState<Service[]>([]); const [message, setMessage] = useState("");
  const [branchForm, setBranchForm] = useState({ name: "", slug: "", phone: "", address: "" });
  const [serviceForm, setServiceForm] = useState({ code: "HEARING_TEST", name: "Eshitishni tekshirtirish", durationMinutes: 30 });
  const token = typeof window === "undefined" ? "" : localStorage.getItem("soundz_admin_token") ?? "";
  const headers = { "content-type": "application/json", authorization: `Bearer ${token}` };

  async function load(): Promise<void> {
    if (!token) { router.replace("/login"); return; }
    const [branchResponse, serviceResponse] = await Promise.all([
      fetch(`${API_URL}/admin/settings/branches`, { headers }),
      fetch(`${API_URL}/admin/settings/services`, { headers }),
    ]);
    if (branchResponse.status === 401 || serviceResponse.status === 401) { router.replace("/login"); return; }
    const branchData = await branchResponse.json(); const serviceData = await serviceResponse.json();
    setBranches(branchData.items ?? []); setServices(serviceData.items ?? []);
  }

  useEffect(() => { void load(); }, []);

  async function createBranch(event: FormEvent): Promise<void> {
    event.preventDefault(); setMessage("");
    const response = await fetch(`${API_URL}/admin/settings/branches`, { method: "POST", headers, body: JSON.stringify({ ...branchForm, phone: branchForm.phone || undefined, address: branchForm.address || undefined, isActive: true }) });
    const data = await response.json(); if (!response.ok) { setMessage(data.message ?? "Filial saqlanmadi"); return; }
    setBranchForm({ name: "", slug: "", phone: "", address: "" }); setMessage("Filial yaratildi."); await load();
  }

  async function createService(event: FormEvent): Promise<void> {
    event.preventDefault(); setMessage("");
    const response = await fetch(`${API_URL}/admin/settings/services`, { method: "POST", headers, body: JSON.stringify({ ...serviceForm, isActive: true }) });
    const data = await response.json(); if (!response.ok) { setMessage(data.message ?? "Xizmat saqlanmadi"); return; }
    setMessage("Xizmat yaratildi."); await load();
  }

  async function toggleService(branch: Branch, service: Service, enabled: boolean): Promise<void> {
    await fetch(`${API_URL}/admin/settings/branches/${branch.id}/services/${service.id}`, { method: "PUT", headers, body: JSON.stringify({ isActive: enabled }) });
    await load();
  }

  async function applyDefaultSchedule(branchId: string): Promise<void> {
    const items = weekdays.map((_, weekday) => ({ weekday, openMinute: 9 * 60, closeMinute: 18 * 60, isClosed: weekday === 0 }));
    await fetch(`${API_URL}/admin/settings/branches/${branchId}/schedules`, { method: "PUT", headers, body: JSON.stringify({ items }) });
    setMessage("09:00–18:00 jadval qo‘llandi."); await load();
  }

  function minutes(value: number): string { return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`; }
  function logout(): void { localStorage.removeItem("soundz_admin_token"); router.push("/login"); }

  return <div className="admin-shell"><aside className="sidebar"><div className="logo-row"><div className="brand-mark small">S</div><strong>Soundz</strong></div><nav><Link href="/leads">Murojaatlar</Link><Link href="/appointments">Qabullar</Link><Link className="active" href="/settings/branches">Filiallar</Link><span className="disabled">Mahsulotlar</span></nav><button className="ghost-button" onClick={logout}>Chiqish</button></aside>
    <main className="admin-main"><header className="page-header"><div><p className="eyebrow">OPERATING SETUP</p><h1>Filial va xizmatlar</h1><p>Qabul vaqtlarini chiqarish uchun filial, xizmat va ish jadvalini sozlang.</p></div></header>
      {message && <p className="notice">{message}</p>}
      <div className="settings-grid"><section className="panel settings-card"><h2>Yangi filial</h2><form onSubmit={createBranch}><label>Nomi<input value={branchForm.name} onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })} required /></label><label>Slug<input value={branchForm.slug} onChange={(e) => setBranchForm({ ...branchForm, slug: e.target.value })} required /></label><label>Telefon<input value={branchForm.phone} onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })} /></label><label>Manzil<textarea value={branchForm.address} onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })} /></label><button className="primary-button">Filial yaratish</button></form></section>
        <section className="panel settings-card"><h2>Yangi xizmat</h2><form onSubmit={createService}><label>Kod<input value={serviceForm.code} onChange={(e) => setServiceForm({ ...serviceForm, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]+/g, "_") })} required /></label><label>Nomi<input value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} required /></label><label>Davomiyligi (daqiqa)<input type="number" min={10} max={240} value={serviceForm.durationMinutes} onChange={(e) => setServiceForm({ ...serviceForm, durationMinutes: Number(e.target.value) })} required /></label><button className="primary-button">Xizmat yaratish</button></form></section></div>
      <section className="branch-list">{branches.length === 0 ? <div className="panel empty-card">Hozircha filial yo‘q.</div> : branches.map((branch) => <article className="panel branch-card" key={branch.id}><div className="branch-heading"><div><p className="eyebrow">{branch.slug}</p><h2>{branch.name}</h2><p>{branch.address || "Manzil kiritilmagan"}</p></div><button className="outline-button" onClick={() => void applyDefaultSchedule(branch.id)}>Dush–Shan 09:00–18:00</button></div><div className="branch-config"><div><h3>Xizmatlar</h3>{services.length === 0 ? <p>Xizmat yarating.</p> : services.map((service) => { const enabled = branch.services.some((x) => x.serviceId === service.id && x.isActive); return <label className="service-toggle" key={service.id}><input type="checkbox" checked={enabled} onChange={(e) => void toggleService(branch, service, e.target.checked)} /><span><strong>{service.name}</strong><small>{service.durationMinutes} daqiqa</small></span></label>; })}</div><div><h3>Ish jadvali</h3><div className="schedule-list">{weekdays.map((day, weekday) => { const schedule = branch.schedules.find((x) => x.weekday === weekday); return <div key={day}><span>{day}</span><strong>{!schedule || schedule.isClosed ? "Yopiq" : `${minutes(schedule.openMinute)}–${minutes(schedule.closeMinute)}`}</strong></div>; })}</div></div></div></article>)}</section>
    </main></div>;
}
