import { ReactNode } from "react";

type MarqueeProps = {
  children: ReactNode;
  /** To'liq aylanish davomiyligi (s) */
  duration?: number;
  className?: string;
  ariaLabel?: string;
};

/**
 * Cheksiz gorizontal lenta (brend logolari uchun). Sof CSS animatsiya
 * (transform), hover'da pauza, reduced-motion'da statik qator.
 * Kontent ekran o'quvchilar uchun bir marta e'lon qilinadi.
 */
export function Marquee({ children, duration = 32, className = "", ariaLabel }: MarqueeProps) {
  return (
    <div className={`sz-marquee ${className}`.trim()} aria-label={ariaLabel} style={{ ["--sz-marquee-duration" as string]: `${duration}s` }}>
      <div className="sz-marquee__track">
        <div className="sz-marquee__group">{children}</div>
        <div className="sz-marquee__group" aria-hidden>{children}</div>
      </div>
    </div>
  );
}
