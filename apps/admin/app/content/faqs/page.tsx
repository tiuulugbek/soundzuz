"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";
type Faq = { id:string; locale:"uz"|"ru"; question:string; shortAnswer:string; fullAnswer?:string|null; status:string; sortOrder:number; categoryName?:string|null; updatedAt:string };
const labels:Record<string,string>={DRAFT:"Qoralama",IN_REVIEW:"Tekshiruvda",APPROVED:"Tasdiqlangan",PUBLISHED:"Nashr qilingan",NEEDS_UPDATE:"Yangilash kerak",ARCHIVED:"Arxivlangan"};

export default function FaqsPage(){
  const router=useRouter();
  const [items,setItems]=useState<Faq[]>([]);
  const [search,setSearch]=useState("");
  const [question,setQuestion]=useState("");
  const [shortAnswer,setShortAnswer]=useState("");
  const [fullAnswer,setFullAnswer]=useState("");
  const [status,setStatus]=useState("DRAFT");
  const [locale,setLocale]=useState<"uz"|"ru">("uz");
  const [sortOrder,setSortOrder]=useState(0);
  const [feedback,setFeedback]=useState("");
  const [loading,setLoading]=useState(true);
  const token=typeof window==="undefined"?"":localStorage.getItem("soundz_admin_token")??"";

  function load(){
    if(!token){router.replace("/login");return;}
    setLoading(true);
    fetch(`${API_URL}/admin/content/faqs`,{headers:{authorization:`Bearer ${token}`}}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.message??"FAQ olinmadi");setItems(Array.isArray(d)?d:d.items??[]);}).catch(e=>setFeedback(e instanceof Error?e.message:"FAQ olinmadi")).finally(()=>setLoading(false));
  }
  useEffect(load,[router,token]);
  const filtered=useMemo(()=>items.filter(i=>`${i.question} ${i.shortAnswer}`.toLowerCase().includes(search.toLowerCase())),[items,search]);

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setFeedback("");
    try{
      const response=await fetch(`${API_URL}/admin/content/faqs`,{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${token}`},body:JSON.stringify({question,shortAnswer,fullAnswer:fullAnswer||undefined,status,locale,sortOrder})});
      const data=await response.json();if(!response.ok)throw new Error(data.message??"FAQ saqlanmadi");
      setQuestion("");setShortAnswer("");setFullAnswer("");setStatus("DRAFT");setSortOrder(0);setFeedback("Savol-javob saqlandi.");load();
    }catch(e){setFeedback(e instanceof Error?e.message:"FAQ saqlanmadi");}
  }

  return <div className="admin-shell"><aside className="sidebar"><div className="logo-row"><div className="brand-mark small">S</div><strong>Soundz</strong></div><nav><Link href="/leads">Murojaatlar</Link><Link href="/appointments">Qabullar</Link><Link href="/settings/branches">Filiallar</Link><Link href="/content/articles">Maqolalar</Link><Link className="active" href="/content/faqs">FAQ</Link><span className="disabled">Mahsulotlar</span></nav></aside><main className="admin-main"><header className="page-header"><div><p className="eyebrow">BILIM MARKAZI</p><h1>Savol-javoblar</h1><p>Tez-tez beriladigan savollarni yarating va nashr qiling.</p></div></header>{feedback&&<p className={feedback.includes("saqlandi")?"notice":"error-message"}>{feedback}</p>}<section className="faq-admin-grid"><form className="panel faq-create" onSubmit={submit}><h2>Yangi FAQ</h2><label>Savol<input value={question} onChange={e=>setQuestion(e.target.value)} required /></label><label>Qisqa javob<textarea value={shortAnswer} onChange={e=>setShortAnswer(e.target.value)} required /></label><label>To‘liq javob<textarea className="faq-answer" value={fullAnswer} onChange={e=>setFullAnswer(e.target.value)} /></label><div className="form-row"><label>Til<select value={locale} onChange={e=>setLocale(e.target.value as "uz"|"ru")}><option value="uz">O‘zbekcha</option><option value="ru">Ruscha</option></select></label><label>Holat<select value={status} onChange={e=>setStatus(e.target.value)}>{Object.entries(labels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label>Tartib<input type="number" min={0} value={sortOrder} onChange={e=>setSortOrder(Number(e.target.value))} /></label></div><button className="primary-button">Saqlash</button></form><section className="panel"><div className="filters"><input placeholder="Savol yoki javob bo‘yicha qidirish" value={search} onChange={e=>setSearch(e.target.value)} /></div><div className="table-wrap"><table><thead><tr><th>Savol</th><th>Til</th><th>Holat</th><th>Tartib</th><th>Yangilangan</th></tr></thead><tbody>{loading?<tr><td colSpan={5}>Yuklanmoqda…</td></tr>:filtered.length===0?<tr><td colSpan={5}>FAQ topilmadi.</td></tr>:filtered.map(item=><tr key={item.id}><td><strong>{item.question}</strong><small>{item.shortAnswer}</small></td><td>{item.locale.toUpperCase()}</td><td><span className={`status content-status-${item.status.toLowerCase()}`}>{labels[item.status]??item.status}</span></td><td>{item.sortOrder}</td><td>{new Intl.DateTimeFormat("uz-UZ",{dateStyle:"short"}).format(new Date(item.updatedAt))}</td></tr>)}</tbody></table></div></section></section></main></div>;
}