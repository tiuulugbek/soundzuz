"use client";

import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";

type RevealProps = {
  children: ReactNode;
  /** Kechikish (ms) — ketma-ket stagger effekti uchun */
  delay?: number;
  /** Boshlang'ich siljish (px, pastdan yuqoriga) */
  y?: number;
  /** Element qismi ko'ringanda ishga tushadi (0..1) */
  threshold?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li" | "span";
};

/**
 * Scroll-reveal primitivi: element viewport'ga kirganda opacity+transform
 * bilan yumshoq paydo bo'ladi. Faqat GPU-friendly xususiyatlar ishlatiladi,
 * `prefers-reduced-motion` avtomatik hurmat qilinadi (tokens.css orqali).
 */
export function Reveal({ children, delay = 0, y = 28, threshold = 0.18, className = "", as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  const style: CSSProperties = {
    ["--sz-reveal-delay" as string]: `${delay}ms`,
    ["--sz-reveal-y" as string]: `${y}px`,
  };

  return (
    <Tag ref={ref as never} style={style} className={`sz-reveal ${visible ? "is-visible" : ""} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
