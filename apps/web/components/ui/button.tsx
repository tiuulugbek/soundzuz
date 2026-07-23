import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "on-dark";
type Size = "md" | "lg";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

type ButtonAsLink = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type ButtonAsButton = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

function classes(variant: Variant, size: Size, className: string): string {
  return `sz-btn sz-btn--${variant} sz-btn--${size} ${className}`.trim();
}

/**
 * Asosiy tugma primitivi. `href` berilsa <a>, aks holda <button> render qiladi.
 * Variantlar: primary (apelsin), secondary (kontur), ghost (matn), on-dark.
 */
export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "primary", size = "md", children, className = "", ...rest } = props;
  if ("href" in props && props.href !== undefined) {
    const { variant: _v, size: _s, className: _c, ...anchorProps } = props;
    return (
      <a {...anchorProps} className={classes(variant, size, className)}>
        <span className="sz-btn__label">{children}</span>
        <span className="sz-btn__arrow" aria-hidden>→</span>
      </a>
    );
  }
  return (
    <button {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} className={classes(variant, size, className)}>
      <span className="sz-btn__label">{children}</span>
      <span className="sz-btn__arrow" aria-hidden>→</span>
    </button>
  );
}
