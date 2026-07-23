"use client";

import { ReactNode, useRef } from "react";

type MagneticProps = {
  children: ReactNode;
  /** Tortishish kuchi (px) */
  strength?: number;
  className?: string;
};

/**
 * "Magnit" mikro-interaksiya: kursor yaqinlashganda element unga yumshoq
 * tortiladi, chiqqanda prujina bilan joyiga qaytadi. Faqat transform —
 * layout'ga ta'sir qilmaydi. Touch qurilmalarda va reduced-motion'da passiv.
 */
export function Magnetic({ children, strength = 10, className = "" }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(event: React.PointerEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node || event.pointerType !== "mouse") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = node.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2 * strength;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2 * strength;
    node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  }

  function onLeave() {
    const node = ref.current;
    if (!node) return;
    node.style.transform = "translate3d(0, 0, 0)";
  }

  return (
    <div ref={ref} className={`sz-magnetic ${className}`.trim()} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </div>
  );
}
