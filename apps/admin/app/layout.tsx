import type { Metadata } from "next";
import "./globals.css";
import "./media-picker.css";
import "./product-admin.css";
import "./gallery-manager.css";

export const metadata: Metadata = {
  title: "Soundz Admin",
  description: "Soundz lead, kontent va katalog boshqaruvi",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
