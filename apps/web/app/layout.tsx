import type { Metadata } from "next";
import { Analytics } from "../components/analytics";
import "@fontsource-variable/manrope";
import "@fontsource-variable/inter";
import "./tokens.css";
import "./ui.css";
import "./globals.css";
import "./catalog-reading.css";
import "./article-rich.css";
import "./directory.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://soundz.uz";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Soundz — Eshitish moslamalari va Custom IEM",
  description: "Eshitishni tekshirtirish, mos eshitish moslamasini tanlash va professional Custom In-Ear Monitor xizmatlari.",
  alternates: {
    canonical: "/",
    languages: { "uz-UZ": "/", "ru-UZ": "/ru", "x-default": "/" },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="uz"><body>{children}<Analytics /></body></html>;
}
