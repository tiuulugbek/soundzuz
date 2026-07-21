"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@soundz.uz");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Kirish amalga oshmadi");
      localStorage.setItem("soundz_admin_token", data.accessToken);
      localStorage.setItem("soundz_admin_user", JSON.stringify(data.user));
      router.push("/leads");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Kirish amalga oshmadi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-brand">
        <div className="brand-mark">S</div>
        <p className="eyebrow">SOUNDZ OPERATIONS</p>
        <h1>Murojaatlarni tartibli boshqaring.</h1>
        <p>Sayt, Telegram va filial jarayonlari yagona boshqaruv panelida.</p>
      </section>
      <section className="login-card">
        <p className="eyebrow">ADMIN PANEL</p>
        <h2>Tizimga kirish</h2>
        <form onSubmit={submit}>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Parol<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} /></label>
          {error && <p className="error-message">{error}</p>}
          <button className="primary-button" disabled={loading}>{loading ? "Tekshirilmoqda…" : "Kirish"}</button>
        </form>
        <p className="helper">Dastlabki parol serverdagi <code>ADMIN_SEED_PASSWORD</code> orqali beriladi.</p>
      </section>
    </main>
  );
}
