import type { Metadata } from "next";
import "./globals.css";
import "./catalog-reading.css";

export const metadata: Metadata = {
  title: "Soundz — Eshitish moslamalari va Custom IEM",
  description: "Eshitishni tekshirtirish, mos eshitish moslamasini tanlash va professional Custom In-Ear Monitor xizmatlari.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="uz"><body>{children}</body></html>;
}
