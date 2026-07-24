import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "../../../../components/site/site-header";
import { SiteFooter } from "../../../../components/site/site-footer";
import { JsonLd, breadcrumbJsonLd, localBusinessJsonLd } from "../../../../components/seo/json-ld";
import type { Locale } from "../../../../i18n/routing";
import { buildPageMetadata, localePath } from "../../../../lib/seo";
import { fetchBranch, formatMinutes, locMediaUrl, weekdayKey } from "../../../../lib/locations";
import "../../locations.css";

type PageParams = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const branch = await fetchBranch(slug);
  const t = await getTranslations({ locale, namespace: "branches" });
  if (!branch) return {};
  return buildPageMetadata({
    locale: locale as Locale,
    title: `${branch.name} — ${t("title")} | Soundz`,
    description: branch.address ? `${branch.name}, ${branch.address}` : branch.name,
    path: `/branches/${slug}`,
    ogImage: branch.imageUrl ? locMediaUrl(branch.imageUrl) : undefined,
  });
}

export default async function BranchPage({ params }: PageParams) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(rawLocale);
  const t = await getTranslations({ locale: rawLocale, namespace: "branches" });
  const td = await getTranslations({ locale: rawLocale, namespace: "days" });
  const branch = await fetchBranch(slug);
  if (!branch) notFound();

  const schedules = [...(branch.schedules ?? [])].sort((a, b) => ((a.weekday || 7) - (b.weekday || 7)));
  const mapUrl = branch.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${branch.name} ${branch.address}`)}` : null;
  const telHref = branch.phone ? `tel:${branch.phone.replace(/[^+\d]/g, "")}` : null;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: "Soundz", path: "/" },
        { name: t("title"), path: "/branches" },
        { name: branch.name, path: `/branches/${slug}` },
      ])} />
      <JsonLd data={localBusinessJsonLd({ name: branch.name, slug: branch.slug, address: branch.address, phone: branch.phone, imageUrl: branch.imageUrl ? locMediaUrl(branch.imageUrl) : undefined })} />
      <SiteHeader />
      <main className="sz-loc">
        <section className="sz-loc__hero">
          <div className="sz-container">
            <a className="sz-loc__back" href={localePath(locale, "/branches")}>← {t("backToBranches")}</a>
            <h1 className="sz-loc__title">{branch.name}</h1>
            {branch.address ? <p className="sz-loc__lead">{branch.address}</p> : null}
          </div>
        </section>

        <section className="sz-container sz-loc__section sz-branch__layout">
          <div className="sz-branch__main">
            {branch.imageUrl ? <div className="sz-branch__hero-img"><img src={locMediaUrl(branch.imageUrl)} alt={branch.name} /></div> : null}

            <div className="sz-branch__info">
              {branch.phone ? (
                <div className="sz-branch__row"><span>{t("phone")}</span><a href={telHref ?? undefined}>{branch.phone}</a></div>
              ) : null}
              {branch.address ? (
                <div className="sz-branch__row"><span>{t("address")}</span><span>{branch.address}</span></div>
              ) : null}
            </div>

            {schedules.length > 0 ? (
              <div className="sz-branch__block">
                <h2>{t("hours")}</h2>
                <dl className="sz-branch__hours">
                  {schedules.map((s) => (
                    <div className="sz-branch__hour" key={s.weekday}>
                      <dt>{td(weekdayKey(s.weekday))}</dt>
                      <dd>{s.isClosed ? t("closed") : `${formatMinutes(s.openMinute)} – ${formatMinutes(s.closeMinute)}`}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            {branch.services && branch.services.length > 0 ? (
              <div className="sz-branch__block">
                <h2>{t("services")}</h2>
                <ul className="sz-branch__services">
                  {branch.services.map((sv) => (
                    <li key={sv.id}><strong>{sv.name}</strong>{sv.description ? <span> — {sv.description}</span> : null}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <aside className="sz-branch__aside">
            <div className="sz-branch__cta">
              <a className="sz-btn sz-btn--primary sz-btn--lg" href={localePath(locale, "/#contact")}>{t("book")}</a>
              {telHref ? <a className="sz-btn sz-btn--ghost sz-btn--md" href={telHref}>{branch.phone}</a> : null}
              {mapUrl ? <a className="sz-btn sz-btn--secondary sz-btn--md" href={mapUrl} target="_blank" rel="noopener noreferrer">{t("map")} →</a> : null}
            </div>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
