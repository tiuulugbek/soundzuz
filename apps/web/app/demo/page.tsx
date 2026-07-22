import type { Metadata } from "next";
import { DemoClient } from "./demo-client";

export const metadata: Metadata = {
  title: "Soundz Demo — Vercel Preview",
  description: "Soundz platformasining backend talab qilmaydigan interaktiv demo versiyasi.",
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  return <DemoClient />;
}
