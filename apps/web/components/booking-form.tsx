"use client";

import { FormEvent, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";
type Branch = { id: string; name: string; address?: string | null };
type Service = { id: string; name: string; durationMinutes: number };
type Slot = { startsAt: string; endsAt: string };

function tomorrow(): string {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function BookingForm() {
  const [branches, setBranches] = useState<Branch[]>([]); const [services, setServices] = useState<Service[]>([]); const [slots, setSlots] = useState<Slot[]>([]);
  const [branchId, setBranchId] = useState(""); const [serviceId, setServiceId] = useState(""); const [date, setDate] = useState(tomorrow()); const [startsAt, setStartsAt] = useState("");
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [message, setMessage] = useState(""); const [feedback, setFeedback] = useState(""); const [loading, setLoading] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  useEffect(() => { fetch(`${API_URL}/public/booking/branches`).then((r) => r.json()).then((d) => { setBranches(d.items ?? []); if (d.items?.[0]) setBranchId(d.items[0].id); }).catch(() => setBranches([])); }, []);
  useEffect(() => { if (!branchId) return; setServiceId(""); setSlots([]); fetch(`${API_URL}/public/booking/services?branchId=${encodeURIComponent(branchId)}`).then((r) => r.json()).then((d) => { setServices(d.items ?? []); if (d.items?.[0]) setServiceId(d.items[0].id); }); }, [branchId]);
  useEffect(() => { if (!branchId || !serviceId || !date) return; setStartsAt(""); fetch(`${API_URL}/public/booking/slots?branchId=${encodeURIComponent(branchId)}&serviceId=${encodeURIComponent(serviceId)}&date=${date}`).then((r) => r.json()).then((d) => setSlots(d.items ?? [])).catch(() => setSlots([])); }, [branchId, serviceId, date]);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault(); if (!startsAt) { setFeedback("Bo‘sh vaqtni tanlang."); return; }
    setLoading(true); setFeedback(""); const params = new URLSearchParams(window.location.search);
    try {
      const response = await fetch(`${API_URL}/public/booking/appointments`, { method: "POST", headers: { "content-type": "application/json", "x-idempotency-key": idempotencyKey }, body: JSON.stringify({ name, phone, branchId, serviceId, startsAt, message: message || undefined, locale: "uz", sourceUrl: window.location.href, referrer: document.referrer || undefined, utmSource: params.get("utm_source") || undefined, utmMedium: params.get("utm_medium") || undefined, utmCampaign: params.get("utm_campaign") || undefined, consent: true }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.message ?? "Qabul saqlanmadi");
      setFeedback(`${data.message} Qabul raqami: ${data.reference}`); setName(""); setPhone(""); setMessage(""); setStartsAt(""); setIdempotencyKey(crypto.randomUUID());
    } catch (reason) { setFeedback(reason instanceof Error ? reason.message : "Qabul saqlanmadi"); }
    finally { setLoading(false); }
  }

  return <form className="booking-form" onSubmit={submit}><div className="booking-grid"><label>Filial<select value={branchId} onChange={(e) => setBranchId(e.target.value)} required><option value="">Filialni tanlang</option>{branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label><label>Xizmat<select value={serviceId} onChange={(e) => setServiceId(e.target.value)} required><option value="">Xizmatni tanlang</option>{services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Sana<input type="date" value={date} min={tomorrow()} onChange={(e) => setDate(e.target.value)} required /></label><label>Bo‘sh vaqt<select value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required><option value="">Vaqtni tanlang</option>{slots.map((slot) => <option key={slot.startsAt} value={slot.startsAt}>{new Intl.DateTimeFormat("uz-UZ", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tashkent" }).format(new Date(slot.startsAt))}</option>)}</select></label><label>Ismingiz<input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} /></label><label>Telefon<input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+998 90 123 45 67" /></label></div><label>Izoh<textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Qo‘shimcha ma’lumot" /></label>{branches.length === 0 && <p className="booking-note">Filial ma’lumotlari kiritilgach bo‘sh vaqtlar shu yerda ko‘rinadi. Lokal demo uchun <code>SEED_DEMO_DATA=true</code> ishlatiladi.</p>}<button className="primary" disabled={loading || branches.length === 0}>{loading ? "Saqlanmoqda…" : "Qabulga yozilish"}</button>{feedback && <p className="form-feedback success">{feedback}</p>}</form>;
}
