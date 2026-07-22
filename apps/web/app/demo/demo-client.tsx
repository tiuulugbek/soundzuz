"use client";

import { FormEvent, useMemo, useState } from "react";

const products = [
  { id: "demo-1", brand: "Oticon", name: "Intent miniRITE", type: "RIC", price: "18 900 000 so‘mdan", description: "Nutqni ajratish, qayta zaryadlash va kundalik Bluetooth ulanishi." },
  { id: "demo-2", brand: "Signia", name: "Pure Charge&Go", type: "RIC", price: "15 500 000 so‘mdan", description: "Ixcham korpus, shovqinni boshqarish va individual sozlash." },
  { id: "demo-3", brand: "ReSound", name: "Nexia MicroRIE", type: "miniRIE", price: "17 200 000 so‘mdan", description: "Tabiiy ovoz, zamonaviy ulanish va yengil kundalik foydalanish." },
];

const branches = ["Toshkent — Chilonzor", "Samarqand — Kattaqo‘rg‘on", "Farg‘ona — Marg‘ilon", "Qoraqalpog‘iston — Nukus"];

export function DemoClient() {
  const [selectedProduct, setSelectedProduct] = useState(products[0].name);
  const [branch, setBranch] = useState(branches[0]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const reference = useMemo(() => `DEMO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main>
      <header className="site-header">
        <a className="logo" href="#top"><span>S</span>Soundz</a>
        <nav>
          <a href="#catalog">Moslamalar</a>
          <a href="#branches">Filiallar</a>
          <a href="#booking">Qabul</a>
        </nav>
        <a className="header-cta" href="#booking">Qabulga yozilish</a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">VERCEL DEMO • SOUNDZ</p>
          <h1>Yaqinlaringiz ovozini yana aniq eshiting.</h1>
          <p className="lead">Bu demo versiyada katalog, filial tanlash va qabulga yozilish oqimini backend o‘rnatmasdan ko‘rishingiz mumkin.</p>
          <div className="hero-actions">
            <a className="primary" href="#booking">Eshitishni tekshirtirish</a>
            <a className="secondary" href="#catalog">Moslamalarni ko‘rish</a>
          </div>
          <div className="trust-row">
            <span>✓ Professional audiometriya</span>
            <span>✓ Individual sozlash</span>
            <span>✓ 4 ta demo filial</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="sound-orbit"><div className="device"><span /></div></div>
          <div className="floating-card top"><strong>Tabiiy ovoz</strong><small>Nutqni aniqroq eshitish</small></div>
          <div className="floating-card bottom"><strong>Mutaxassis yordami</strong><small>Individual tanlash va sozlash</small></div>
        </div>
      </section>

      <section className="steps-section" id="catalog">
        <p className="eyebrow">DEMO KATALOG</p>
        <h2>Eshitish moslamalaridan namunalar</h2>
        <div className="steps">
          {products.map((product, index) => (
            <article key={product.id}>
              <span>0{index + 1}</span>
              <p className="eyebrow">{product.brand} • {product.type}</p>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <strong>{product.price}</strong>
              <button className="secondary" type="button" onClick={() => { setSelectedProduct(product.name); document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" }); }}>Tanlash</button>
            </article>
          ))}
        </div>
      </section>

      <section className="path-section" id="branches">
        <article className="path-card hearing">
          <p className="eyebrow">FILIAL</p>
          <h2>Toshkent</h2>
          <p>Audiometriya, eshitish moslamasi tanlash, sozlash va servis.</p>
        </article>
        <article className="path-card iem">
          <p className="eyebrow">FILIAL</p>
          <h2>Hududiy markazlar</h2>
          <p>Samarqand, Farg‘ona va Qoraqalpog‘istonda demo filiallar.</p>
        </article>
      </section>

      <section className="booking-section" id="booking">
        <div className="section-heading">
          <div><p className="eyebrow">DEMO QABUL</p><h2>Qabulga yozilish oqimini sinab ko‘ring.</h2></div>
          <p>Bu forma hech qayerga yuborilmaydi. Productionda shu ma’lumotlar CRM, operator va Telegram xabarnomasiga tushadi.</p>
        </div>
        <form className="booking-form" onSubmit={submit}>
          <div className="booking-grid">
            <label>Mahsulot<select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>{products.map((p) => <option key={p.id}>{p.name}</option>)}</select></label>
            <label>Filial<select value={branch} onChange={(e) => setBranch(e.target.value)}>{branches.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Ismingiz<input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ismingiz" /></label>
            <label>Telefon<input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" /></label>
          </div>
          <label>Izoh<textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Qo‘shimcha ma’lumot" /></label>
          <button className="primary" type="submit">Demo so‘rov yuborish</button>
          {submitted && <p className="form-feedback success">Demo so‘rov qabul qilindi. Raqam: {reference}. Tanlov: {selectedProduct}, {branch}.</p>}
        </form>
      </section>

      <footer>
        <a className="logo" href="#top"><span>S</span>Soundz</a>
        <p>Demo rejim — ma’lumotlar saqlanmaydi.</p>
        <a href="/ru">Русский</a>
      </footer>
    </main>
  );
}
