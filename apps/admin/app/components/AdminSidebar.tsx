"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

/**
 * Admin panelning yagona yon menyusi.
 *
 * Ilgari har sahifa o'z menyusini qo'lda yozar, natijada ro'yxatlar bir-biriga mos
 * kelmasdi — masalan `/leads` dan kontent bo'limlariga umuman havola yo'q edi,
 * `/settings/branches` da esa "Mahsulotlar" mavjud bo'lsa ham o'chirilgan ko'rinardi.
 */
const LINKS: Array<{ href: string; label: string }> = [
  { href: "/leads", label: "Murojaatlar" },
  { href: "/appointments", label: "Qabullar" },
  { href: "/settings/branches", label: "Filiallar" },
  { href: "/products", label: "Mahsulotlar" },
  { href: "/products/taxonomies", label: "Filtrlar" },
  { href: "/content/articles", label: "Maqolalar" },
  { href: "/content/faqs", label: "FAQ" },
  { href: "/content/categories", label: "Kategoriyalar" },
  { href: "/content/media", label: "Media" },
  { href: "/content/insights", label: "Analitika" },
];

export function AdminSidebar() {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  function logout() {
    localStorage.removeItem("soundz_admin_token");
    router.replace("/login");
  }

  return (
    <aside className="sidebar">
      <div className="logo-row">
        <div className="brand-mark small">S</div>
        <strong>Soundz</strong>
      </div>
      <nav>
        {LINKS.map((link) => {
          // Eng uzun mos keluvchi havola faol bo'ladi — `/products` va
          // `/products/taxonomies` bir vaqtda yonib turmasligi uchun.
          const isActive =
            pathname === link.href ||
            (pathname.startsWith(`${link.href}/`) &&
              !LINKS.some((other) => other !== link && other.href.startsWith(`${link.href}/`) && pathname.startsWith(other.href)));
          return (
            <Link key={link.href} className={isActive ? "active" : ""} href={link.href}>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <button className="ghost-button" onClick={logout}>Chiqish</button>
    </aside>
  );
}
