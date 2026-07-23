"use client";

import { useEffect, useRef, useState } from "react";

type CounterProps = {
  /** Yakuniy qiymat */
  value: number;
  /** Old qo'shimcha (masalan "+") va orqa qo'shimcha */
  prefix?: string;
  suffix?: string;
  /** Animatsiya davomiyligi (ms) */
  duration?: number;
  className?: string;
};

/**
 * Ko'ringanda 0 dan qiymatgacha sanaydigan raqam.
 * requestAnimationFrame + easeOutExpo; reduced-motion'da darhol yakuniy qiymat.
 */
export function Counter({ value, prefix = "", suffix = "", duration = 1400, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const run = () => {
      if (started.current) return;
      started.current = true;
      if (reduced) { setDisplay(value); return; }
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setDisplay(Math.round(value * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (typeof IntersectionObserver === "undefined") { run(); return; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { run(); observer.disconnect(); }
    }, { threshold: 0.5 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref} className={className}>{prefix}{display.toLocaleString("ru-RU").replace(/ /g, " ")}{suffix}</span>;
}
