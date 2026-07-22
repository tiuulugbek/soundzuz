"use client";

import { FormEvent, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

type Branch = { id: string; name: string; address?: string | null };
type Service = { id: string; name: string; durationMinutes: number };
type Slot = { startsAt: string; endsAt: string };
type Locale = "uz" | "ru";

function tomorrow(): string {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

const copy = {
  uz: {
    selectSlot: "Bo‘sh vaqtni tanlang.",
    productAttached: "Tanlangan mahsulot qabul so‘roviga biriktiriladi.",
    branch: "Filial",
    selectBranch: "Filialni tanlang",
    service: "Xizmat",
    selectService: "Xizmatni tanlang",
    date: "Sana",
    slot: "Bo‘sh vaqt",
    selectTime: "Vaqtni tanlang",
    name: "Ismingiz",
    phone: "Telefon",
    note: "Izoh",
    notePlaceholder: "Qo‘shimcha ma’lumot",
    noBranches: "Filial ma’lumotlari kiritilgach bo‘sh vaqtlar shu yerda ko‘rinadi.",
    submit: "Qabulga yozilish",
    saving: "Saqlanmoqda…",
    saveError: "Qabul saqlanmadi",
    reference: "Qabul raqami",
  },
  ru: {
    selectSlot: "Выберите свободное время.",
    productAttached: "Выбранный товар будет прикреплён к заявке.",
    branch: "Филиал",
    selectBranch: "Выберите филиал",
    service: "Услуга",
    selectService: "Выберите услугу",
    date: "Дата",
    slot: "Свободное время",
    selectTime: "Выберите время",
    name: "Ваше имя",
    phone: "Телефон",
    note: "Комментарий",
    notePlaceholder: "Дополнительная информация",
    noBranches: "Свободное время появится после добавления данных филиалов.",
    submit: "Записаться",
    saving: "Сохраняется…",
    saveError: "Не удалось сохранить запись",
    reference: "Номер записи",
  },
} as const;

export function BookingForm({ locale = "uz" }: { locale?: Locale }) {
  const text = copy[locale];
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [branchId, setBranchId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [productId, setProductId] = useState("");
  const [date, setDate] = useState(tomorrow());
  const [startsAt, setStartsAt] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedBranch = params.get("branch") ?? "";
    const requestedService = params.get("service") ?? "";
    setProductId(params.get("product") ?? "");

    fetch(`${API_URL}/public/booking/branches`)
      .then((response) => response.json())
      .then((data) => {
        const items: Branch[] = data.items ?? [];
        setBranches(items);
        setBranchId(items.some((item) => item.id === requestedBranch) ? requestedBranch : (items[0]?.id ?? ""));
        sessionStorage.setItem("soundz_requested_service", requestedService);
      })
      .catch(() => setBranches([]));
  }, []);

  useEffect(() => {
    if (!branchId) return;
    setServiceId("");
    setSlots([]);

    fetch(`${API_URL}/public/booking/services?branchId=${encodeURIComponent(branchId)}`)
      .then((response) => response.json())
      .then((data) => {
        const items: Service[] = data.items ?? [];
        setServices(items);
        const requested = sessionStorage.getItem("soundz_requested_service") ?? "";
        setServiceId(items.some((item) => item.id === requested) ? requested : (items[0]?.id ?? ""));
        sessionStorage.removeItem("soundz_requested_service");
      })
      .catch(() => setServices([]));
  }, [branchId]);

  useEffect(() => {
    if (!branchId || !serviceId || !date) return;
    setStartsAt("");
    fetch(`${API_URL}/public/booking/slots?branchId=${encodeURIComponent(branchId)}&serviceId=${encodeURIComponent(serviceId)}&date=${date}`)
      .then((response) => response.json())
      .then((data) => setSlots(data.items ?? []))
      .catch(() => setSlots([]));
  }, [branchId, serviceId, date]);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!startsAt) {
      setFeedback(text.selectSlot);
      return;
    }

    setLoading(true);
    setFeedback("");
    const params = new URLSearchParams(window.location.search);

    try {
      const response = await fetch(`${API_URL}/public/booking/appointments`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-idempotency-key": idempotencyKey,
        },
        body: JSON.stringify({
          name,
          phone,
          branchId,
          serviceId,
          productId: productId || undefined,
          startsAt,
          message: message || undefined,
          locale,
          sourceUrl: window.location.href,
          referrer: document.referrer || undefined,
          utmSource: params.get("utm_source") || undefined,
          utmMedium: params.get("utm_medium") || undefined,
          utmCampaign: params.get("utm_campaign") || undefined,
          utmContent: params.get("utm_content") || undefined,
          utmTerm: params.get("utm_term") || undefined,
          consent: true,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? text.saveError);

      setFeedback(`${data.message} ${text.reference}: ${data.reference}`);
      setName("");
      setPhone("");
      setMessage("");
      setStartsAt("");
      setIdempotencyKey(crypto.randomUUID());
    } catch (reason) {
      setFeedback(reason instanceof Error ? reason.message : text.saveError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="booking-form" onSubmit={submit}>
      {productId && <p className="booking-note">{text.productAttached}</p>}
      <div className="booking-grid">
        <label>{text.branch}<select value={branchId} onChange={(event) => setBranchId(event.target.value)} required><option value="">{text.selectBranch}</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
        <label>{text.service}<select value={serviceId} onChange={(event) => setServiceId(event.target.value)} required><option value="">{text.selectService}</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label>
        <label>{text.date}<input type="date" value={date} min={tomorrow()} onChange={(event) => setDate(event.target.value)} required /></label>
        <label>{text.slot}<select value={startsAt} onChange={(event) => setStartsAt(event.target.value)} required><option value="">{text.selectTime}</option>{slots.map((slot) => <option key={slot.startsAt} value={slot.startsAt}>{new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "uz-UZ", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tashkent" }).format(new Date(slot.startsAt))}</option>)}</select></label>
        <label>{text.name}<input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} /></label>
        <label>{text.phone}<input value={phone} onChange={(event) => setPhone(event.target.value)} required placeholder="+998 90 123 45 67" /></label>
      </div>
      <label>{text.note}<textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder={text.notePlaceholder} /></label>
      {branches.length === 0 && <p className="booking-note">{text.noBranches}</p>}
      <button className="primary" disabled={loading || branches.length === 0}>{loading ? text.saving : text.submit}</button>
      {feedback && <p className="form-feedback success">{feedback}</p>}
    </form>
  );
}
