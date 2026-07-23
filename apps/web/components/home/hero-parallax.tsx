"use client";

import { ReactNode, useEffect, useRef } from "react";

/**
 * Hero vizuali uchun yengil parallaks: kursor holatiga qarab qatlamlar
 * (data-depth atributli) turli tezlikda siljiydi. rAF bilan cheklangan,
 * faqat transform, touch va reduced-motion'da passiv.
 */
export function HeroParallax({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let running = false;

    const layers = Array.from(node.querySelectorAll<HTMLElement>("[data-depth]"));

    function tick() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      for (const layer of layers) {
        const depth = Number(layer.dataset.depth ?? 0);
        layer.style.transform = `translate3d(${(currentX * depth).toFixed(1)}px, ${(currentY * depth).toFixed(1)}px, 0)`;
      }
      if (Math.abs(targetX - currentX) < 0.1 && Math.abs(targetY - currentY) < 0.1) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    function schedule() {
      if (!running) { running = true; raf = requestAnimationFrame(tick); }
    }

    function onMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      const rect = node!.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 30;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 22;
      schedule();
    }
    function onLeave() { targetX = 0; targetY = 0; schedule(); }

    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <div ref={ref} className={className}>{children}</div>;
}
