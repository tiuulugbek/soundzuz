"use client";

import { FormEvent, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

export function LeadForm() {
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [type, setType] = useState("HEARING_AID_CONSULTATION");
  const [message, setMessage] = useState(""); const [consent, setConsent] = useState(true); const [state, setState] = useState<"idle"|"loading"|"success"|"error">("idle"); const [feedback, setFeedback] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("loading"); setFeedback("");
    const params = new URLSearchParams(window.location.search);
    try {
      const response = await fetch(`${API_URL}/public/leads`, { method: "POST", headers: { "content-type": "application/json", "x-idempotency-key": idempotencyKey }, body: JSON.stringify({
        name, phone, type, message: message || undefined, locale: "uz", sourceUrl: window.location.href, referrer: document.referrer || undefined,
        utmSource: params.get("utm_source") || undefined, utmMedium: params.get("utm_medium") || undefined, utmCampaign: params.get("utm_campaign") || undefined, consent,
      }) });
      const data = await response.json(); if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(", ") : data.message ?? "Murojaat yuborilmadi");
      setState("success"); setFeedback(`${data.message} Murojaat raqami: ${data.reference}`); setName(""); setPhone(""); setMessage(""); setIdempotencyKey(crypto.randomUUID());
    } catch (reason) { setState("error"); setFeedback(reason instanceof Error ? reason.message : "Murojaat yuborilmadi"); }
  }

  return <form className="lead-form" onSubmit={submit}><h3>Maslahat olish</h3><label>Ismingiz<input value={name} onChange={(e) => setName(e.target.value)} minLength={2} required placeholder="Ismingiz" /></label><label>Telefon raqamingiz<input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+998 90 123 45 67" inputMode="tel" /></label><label>Qiziqayotgan yo‘nalish<select value={type} onChange={(e) => setType(e.target.value)}><option value="HEARING_AID_CONSULTATION">Eshitish moslamasi</option><option value="APPOINTMENT_REQUEST">Qabulga yozilish</option><option value="PRICE_REQUEST">Narxini bilish</option><option value="IEM_CONSULTATION">Custom IEM</option></select></label><label>Qo‘shimcha izoh<textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Qaysi masala bo‘yicha yordam kerak?" /></label><label className="consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required /><span>Ma’lumotlarim murojaatni ko‘rib chiqish uchun saqlanishiga roziman.</span></label><button className="primary form-button" disabled={state === "loading"}>{state === "loading" ? "Yuborilmoqda…" : "Murojaat yuborish"}</button>{feedback && <p className={`form-feedback ${state}`}>{feedback}</p>}</form>;
}
