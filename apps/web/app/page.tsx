import { LeadForm } from "../components/lead-form";
import { BookingForm } from "../components/booking-form";

const categories = [
  { code: "BTE", title: "Quloq orqasidagi", text: "Keng quvvat diapazoni va kundalik qulaylik." },
  { code: "RIC", title: "Ixcham RIC", text: "Tabiiy tovush va deyarli bilinmaydigan ko‘rinish." },
  { code: "CIC", title: "Quloq ichidagi", text: "Individual qolip asosida tayyorlanadigan yechim." },
];

export default function HomePage() {
  return (
    <main>
      <header className="site-header"><a className="logo" href="#"><span>S</span>Soundz</a><nav><a href="#hearing">Eshitish moslamalari</a><a href="#iem">Custom IEM</a><a href="#services">Xizmatlar</a><a href="/foydali-malumotlar">Foydali ma’lumotlar</a><a href="#contact">Aloqa</a></nav><a className="header-cta" href="#contact">Qabulga yozilish</a></header>
      <section className="hero">
        <div className="hero-copy"><p className="eyebrow">ESHITISH SALOMATLIGI MARKAZI</p><h1>Yaqinlaringiz ovozini yana aniq eshiting.</h1><p className="lead">Eshitishni professional tekshirtiring, mutaxassis bilan mos qurilmani tanlang va filialda individual sozlatib oling.</p><div className="hero-actions"><a className="primary" href="#contact">Eshitishni tekshirtirish</a><a className="secondary" href="/foydali-malumotlar">Savollarga javob topish</a></div><div className="trust-row"><span>✓ Professional audiometriya</span><span>✓ Individual sozlash</span><span>✓ Keyingi servis</span></div></div>
        <div className="hero-visual"><div className="sound-orbit"><div className="device"><span></span></div></div><div className="floating-card top"><strong>Tabiiy tovush</strong><small>Shovqinni aqlli kamaytirish</small></div><div className="floating-card bottom"><strong>Filialda sinab ko‘ring</strong><small>Mutaxassis nazorati bilan</small></div></div>
      </section>
      <section className="path-section"><article className="path-card hearing"><p className="eyebrow">ASOSIY YO‘NALISH</p><h2>Eshitish moslamalari</h2><p>Kundalik suhbat, oila va ish hayoti uchun mutaxassis tanlaydigan zamonaviy eshitish yechimlari.</p><a href="#hearing">Yo‘nalishga o‘tish →</a></article><article className="path-card iem" id="iem"><p className="eyebrow">PROFESSIONAL AUDIO</p><h2>Custom In‑Ear Monitor</h2><p>Musiqachilar va sahna professionallari uchun quloq shakliga mos individual monitorlar.</p><a href="#contact">Markazga yozilish →</a></article></section>
      <section className="section" id="hearing"><div className="section-heading"><div><p className="eyebrow">MOSLAMA TURLARI</p><h2>Har bir ehtiyoj uchun alohida yechim</h2></div><p>Mahsulotlar keyin admin panel orqali kiritiladi. Hozir katalog arxitekturasi tayyor.</p></div><div className="category-grid">{categories.map((item) => <article key={item.code}><div className="category-icon">{item.code}</div><h3>{item.title}</h3><p>{item.text}</p><button>Narxini bilish</button></article>)}</div></section>
      <section className="steps-section" id="services"><p className="eyebrow">QANDAY ISHLAYDI?</p><h2>Qurilma sotib olishdan oldin to‘g‘ri tashxis.</h2><div className="steps"><article><span>01</span><h3>Qabulga yoziling</h3><p>Filial va qulay vaqtni tanlang.</p></article><article><span>02</span><h3>Eshitishni tekshirtiring</h3><p>Mutaxassis audiometriya o‘tkazadi.</p></article><article><span>03</span><h3>Mos modelni tanlang</h3><p>Natija, budjet va turmush tarziga qarab.</p></article><article><span>04</span><h3>Filialda sozlating</h3><p>To‘lov va individual sozlash markazda.</p></article></div></section>
      <section className="section"><div className="section-heading"><div><p className="eyebrow">BILIM MARKAZI</p><h2>Eshitish bo‘yicha ishonchli ma’lumotlar</h2></div><p>Audiometriya, eshitish pasayishi, tinnitus, moslamalar va eshitishni asrash bo‘yicha tushunarli maqolalar.</p></div><div className="path-section"><article className="path-card hearing"><h3>Foydali maqolalar</h3><p>O‘zingizni qiziqtirgan mavzuni tanlang yoki savolingizni qidiring.</p><a href="/foydali-malumotlar">Bilim markaziga o‘tish →</a></article><article className="path-card iem"><h3>Tez-tez beriladigan savollar</h3><p>Qabul, audiometriya, narx, moslama va servis savollariga qisqa javoblar.</p><a href="/savol-javob">Savol-javoblarni ko‘rish →</a></article></div></section>
      <section className="booking-section" id="booking"><div className="section-heading"><div><p className="eyebrow">OLDINDAN YOZILISH</p><h2>Filial va qulay vaqtni tanlang.</h2></div><p>So‘rov saqlangach operator siz bilan bog‘lanib qabulni tasdiqlaydi.</p></div><BookingForm /></section>
      <section className="contact-section" id="contact"><div className="contact-copy"><p className="eyebrow">BIRINCHI QADAM</p><h2>Mutaxassis siz bilan bog‘lanadi.</h2><p>Telefon raqamingizni qoldiring. Murojaat bazaga yoziladi, operatorga Telegram orqali yetkaziladi va admin panelda kuzatiladi.</p><ul><li>Onlayn to‘lov talab qilinmaydi</li><li>Qabul oldindan belgilanadi</li><li>To‘lov filialning o‘zida</li></ul></div><LeadForm /></section>
      <footer><a className="logo" href="#"><span>S</span>Soundz</a><p>Eshitishingizni asrang!</p><small>© 2026 Soundz. Platformaning boshlang‘ich prototipi.</small></footer>
    </main>
  );
}
