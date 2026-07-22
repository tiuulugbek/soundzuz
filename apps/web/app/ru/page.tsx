import Link from "next/link";

export default function RussianHomePage() {
  return (
    <main>
      <header className="site-header">
        <Link className="logo" href="/ru"><span>S</span>Soundz</Link>
        <nav>
          <Link href="/ru/eshitish-moslamalari">Слуховые аппараты</Link>
          <Link href="/ru#services">Услуги</Link>
          <Link href="/ru#booking">Запись</Link>
        </nav>
        <Link className="header-cta" href="/ru#booking">Записаться</Link>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">ЦЕНТР ЗДОРОВЬЯ СЛУХА</p>
          <h1>Снова слышите голоса близких ясно.</h1>
          <p className="lead">Проверьте слух, подберите подходящий аппарат вместе со специалистом и настройте его индивидуально в филиале Soundz.</p>
          <div className="hero-actions">
            <Link className="primary" href="/ru#booking">Проверить слух</Link>
            <Link className="secondary" href="/ru/eshitish-moslamalari">Каталог аппаратов</Link>
          </div>
          <div className="trust-row">
            <span>✓ Профессиональная аудиометрия</span>
            <span>✓ Индивидуальная настройка</span>
            <span>✓ Сервисное сопровождение</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="sound-orbit"><div className="device"><span /></div></div>
          <div className="floating-card top"><strong>Естественный звук</strong><small>Интеллектуальное снижение шума</small></div>
          <div className="floating-card bottom"><strong>Попробуйте в филиале</strong><small>Под контролем специалиста</small></div>
        </div>
      </section>

      <section className="path-section" id="services">
        <article className="path-card hearing">
          <p className="eyebrow">ОСНОВНОЕ НАПРАВЛЕНИЕ</p>
          <h2>Слуховые аппараты</h2>
          <p>Современные решения для общения, семьи и работы с профессиональным подбором.</p>
          <Link href="/ru/eshitish-moslamalari">Перейти в каталог →</Link>
        </article>
        <article className="path-card iem">
          <p className="eyebrow">ПРОФЕССИОНАЛЬНЫЙ ЗВУК</p>
          <h2>Custom In-Ear Monitor</h2>
          <p>Индивидуальные внутриканальные мониторы для музыкантов и сценических профессионалов.</p>
          <Link href="/ru#booking">Записаться →</Link>
        </article>
      </section>

      <section className="steps-section">
        <p className="eyebrow">КАК ЭТО РАБОТАЕТ?</p>
        <h2>Правильная диагностика до покупки аппарата.</h2>
        <div className="steps">
          <article><span>01</span><h3>Запишитесь</h3><p>Выберите филиал и удобное время.</p></article>
          <article><span>02</span><h3>Проверьте слух</h3><p>Специалист проведёт аудиометрию.</p></article>
          <article><span>03</span><h3>Выберите модель</h3><p>С учётом результата, бюджета и образа жизни.</p></article>
          <article><span>04</span><h3>Настройте аппарат</h3><p>Индивидуальная настройка выполняется в филиале.</p></article>
        </div>
      </section>

      <section className="booking-section" id="booking">
        <div className="section-heading">
          <div><p className="eyebrow">ПРЕДВАРИТЕЛЬНАЯ ЗАПИСЬ</p><h2>Выберите филиал и удобное время.</h2></div>
          <p>Русская версия формы записи использует ту же безопасную систему бронирования. Оператор свяжется для подтверждения.</p>
        </div>
        <Link className="primary" href="/#booking">Открыть форму записи</Link>
      </section>

      <footer>
        <Link className="logo" href="/ru"><span>S</span>Soundz</Link>
        <p>Берегите свой слух!</p>
        <Link href="/">O‘zbekcha</Link>
      </footer>
    </main>
  );
}
