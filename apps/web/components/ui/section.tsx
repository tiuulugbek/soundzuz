import { ReactNode } from "react";
import { Reveal } from "./reveal";

type SectionProps = {
  children: ReactNode;
  id?: string;
  /** warm — krem fon, dark — grafit fon (sz-dark-scope), plain — oq */
  tone?: "plain" | "warm" | "dark";
  className?: string;
  bleed?: boolean;
};

/** Standart seksiya o'rami: kenglik, bo'shliq va fon ohangini boshqaradi. */
export function Section({ children, id, tone = "plain", className = "", bleed = false }: SectionProps) {
  const toneClass = tone === "dark" ? "sz-section--dark sz-dark-scope" : tone === "warm" ? "sz-section--warm" : "";
  return (
    <section id={id} className={`sz-section ${toneClass} ${bleed ? "sz-section--bleed" : ""} ${className}`.trim()}>
      <div className="sz-container">{children}</div>
    </section>
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "start" | "center" | "split";
  children?: ReactNode;
};

/** Seksiya sarlavhasi: eyebrow + katta sarlavha + izoh, scroll-reveal bilan. */
export function SectionHeading({ eyebrow, title, lead, align = "split", children }: SectionHeadingProps) {
  return (
    <Reveal className={`sz-heading sz-heading--${align}`}>
      <div className="sz-heading__main">
        {eyebrow ? <p className="sz-eyebrow">{eyebrow}</p> : null}
        <h2 className="sz-heading__title">{title}</h2>
      </div>
      {lead ? <p className="sz-heading__lead">{lead}</p> : null}
      {children}
    </Reveal>
  );
}
