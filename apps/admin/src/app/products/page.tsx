"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const API_URL=process.env.NEXT_PUBLIC_API_URL??"http://localhost:4000/v1";
type Product={id:string;slug:string;name:string;brand?:string;status:string;inStock:boolean;isFeatured:boolean;updatedAt:string};

export default function ProductsPage(){
 const router=useRouter(); const [items,setItems]=useState<Product[]>([]); const [search,setSearch]=useState(""); const [status,setStatus]=useState(""); const [error,setError]=useState(""); const token=typeof window==='undefined'?'':localStorage.getItem('soundz_admin_token')??'';
 useEffect(()=>{if(!token){router.replace('/login');return;}fetch(`${API_URL}/admin/catalog/products`,{headers:{authorization:`Bearer ${token}`}}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.message??'Mahsulotlar olinmadi');setItems(Array.isArray(d)?d:[])}).catch(e=>setError(e instanceof Error?e.message:'Xatolik'));},[router,token]);
 const filtered=useMemo(()=>items.filter(x=>(!search||`${x.name} ${x.brand??''} ${x.slug}`.toLowerCase().includes(search.toLowerCase()))&&(!status||x.status===status)),[items,search,status]);
 return <div className="admin-shell"><aside className="sidebar"><div className="logo-row"><div className="brand-mark small">S</div><strong>Soundz</strong></div><nav><Link href="/leads">Murojaatlar</Link><Link href="/appointments">Qabullar</Link><Link className="active" href="/products">Mahsulotlar</Link><Link href="/content/articles">Kontent</Link><Link href="/content/media">Media</Link></nav></aside><main className="admin-main"><header className="page-header"><div><p className="eyebrow">KATALOG</p><h1>Mahsulotlar</h1><p>Eshitish moslamalarini boshqaring.</p></div><Link className="primary-button" href="/products/new">+ Yangi mahsulot</Link></header>{error&&<p className="error-message">{error}</p>}<section className="panel"><div className="filters"><input placeholder="Nomi, brend yoki slug" value={search} onChange={e=>setSearch(e.target.value)}/><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">Barcha holatlar</option><option value="DRAFT">Qoralama</option><option value="PUBLISHED">Nashr qilingan</option><option value="ARCHIVED">Arxiv</option></select></div><div className="table-wrap"><table><thead><tr><th>Mahsulot</th><th>Brend</th><th>Holat</th><th>Mavjudlik</th><th>Yangilangan</th></tr></thead><tbody>{filtered.map(x=><tr key={x.id}><td><Link className="text-link" href={`/products/${x.id}`}>{x.name}</Link><small>/{x.slug}</small></td><td>{x.brand??'—'}</td><td><span className={`status content-status-${x.status.toLowerCase()}`}>{x.status}</span></td><td>{x.inStock?'Mavjud':'Buyurtma bilan'}</td><td>{new Intl.DateTimeFormat('uz-UZ',{dateStyle:'short'}).format(new Date(x.updatedAt))}</td></tr>)}</tbody></table></div></section></main></div>;
}
