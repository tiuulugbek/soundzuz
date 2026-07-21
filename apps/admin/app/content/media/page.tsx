"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL=process.env.NEXT_PUBLIC_API_URL??"http://localhost:4000/v1";
type Variant={key:string;width:number;height:number;sizeBytes:number;url:string};
type Media={id:string;originalName:string;width:number;height:number;altText?:string;caption?:string;variants:Variant[]};

export default function MediaPage(){
 const router=useRouter(); const [items,setItems]=useState<Media[]>([]); const [file,setFile]=useState<File|null>(null);
 const [altText,setAltText]=useState(""); const [caption,setCaption]=useState(""); const [loading,setLoading]=useState(false); const [message,setMessage]=useState("");
 const token=typeof window==='undefined'?'':localStorage.getItem('soundz_admin_token')??'';
 async function load(){if(!token){router.replace('/login');return;}const r=await fetch(`${API_URL}/media`,{headers:{authorization:`Bearer ${token}`}});const d=await r.json();if(r.ok)setItems(Array.isArray(d)?d:[]);}
 useEffect(()=>{void load();},[token]);
 async function submit(e:FormEvent){e.preventDefault();if(!file)return;setLoading(true);setMessage('');const body=new FormData();body.append('file',file);body.append('altText',altText);body.append('caption',caption);try{const r=await fetch(`${API_URL}/media/upload`,{method:'POST',headers:{authorization:`Bearer ${token}`},body});const d=await r.json();if(!r.ok)throw new Error(d.message??'Rasm yuklanmadi');setMessage('Rasm WEBP formatida optimallashtirildi va media kutubxonasiga saqlandi.');setFile(null);setAltText('');setCaption('');await load();}catch(e){setMessage(e instanceof Error?e.message:'Xatolik');}finally{setLoading(false);}}
 return <main className="detail-page"><Link className="back-link" href="/content/articles">← Kontentga qaytish</Link><header className="detail-header"><div><p className="eyebrow">YAGONA MEDIA TIZIMI</p><h1>Media kutubxonasi</h1><p>Bir marta yuklang, maqola, mahsulot, filial, xizmat va bannerlarda qayta ishlating.</p></div></header>
 <section className="settings-grid"><form className="panel settings-card" onSubmit={submit}><h2>Rasm yuklash</h2><p className="helper">Tavsiya: kamida 1600×900 px. JPG, PNG, WEBP yoki HEIC. Maksimal 12 MB. Server originalni saqlamaydi va 320×210, 640×420, 1200×630, 1600×900 WEBP variantlarini yaratadi.</p><label>Fayl<input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={e=>setFile(e.target.files?.[0]??null)} required/></label><label>Alt matn<input value={altText} onChange={e=>setAltText(e.target.value)} placeholder="Masalan: quloq orti eshitish moslamasi" required/></label><label>Izoh<textarea value={caption} onChange={e=>setCaption(e.target.value)}/></label><button className="primary-button" disabled={loading}>{loading?'Optimallashtirilmoqda…':'Rasm yuklash'}</button>{message&&<p className={message.includes('saqlandi')?'notice':'error-message'}>{message}</p>}</form>
 <section className="panel settings-card"><h2>O‘lchamlar bo‘yicha qo‘llash</h2><div className="schedule-list"><div><span>Karta rasmi</span><strong>640×420</strong></div><div><span>Thumbnail</span><strong>320×210</strong></div><div><span>Hero/banner</span><strong>1600×900</strong></div><div><span>SEO / Open Graph</span><strong>1200×630</strong></div><div><span>Mahsulot rasmi</span><strong>1200×1200 keyingi preset</strong></div><div><span>Portret</span><strong>800×1000 keyingi preset</strong></div></div></section></section>
 <section className="media-grid">{items.map(item=>{const preview=item.variants.find(v=>v.key==='card')??item.variants[0];return <article className="panel media-card" key={item.id}>{preview&&<img src={`${API_URL.replace(/\/v1$/,'')}${preview.url}`} alt={item.altText??item.originalName}/>}<div><strong>{item.originalName}</strong><small>{item.width}×{item.height} → WEBP</small><p>{item.altText}</p><div className="variant-tags">{item.variants.map(v=><span key={v.key}>{v.key} {v.width}×{v.height}</span>)}</div></div></article>})}</section></main>;
}
