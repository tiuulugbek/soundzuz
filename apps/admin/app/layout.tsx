import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soundz Admin",
  description: "Soundz lead va qabul boshqaruvi",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
