import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://soundz.uz";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Soundz — слуховые аппараты и Custom IEM",
  description: "Проверка слуха, подбор слуховых аппаратов, индивидуальная настройка и профессиональные Custom In-Ear Monitor.",
  alternates: {
    canonical: "/ru",
    languages: {
      "uz-UZ": "/",
      "ru-UZ": "/ru",
      "x-default": "/",
    },
  },
};

export default function RussianLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div lang="ru">{children}</div>;
}
