import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "../../../../../i18n/routing";
import { buildPageMetadata } from "../../../../../lib/seo";
import { FORM_TYPES, getTypeHub, type FormType } from "../../../../../lib/catalog-hubs";
import { HubPage } from "../../../../../components/catalog/hub-page";
import "../../catalog.css";
import "../../hub.css";

type PageParams = { params: Promise<{ locale: string; type: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, type } = await params;
  const hub = getTypeHub(type as FormType, locale as Locale);
  if (!hub) return {};
  return buildPageMetadata({
    locale: locale as Locale,
    title: hub.content.title,
    description: hub.content.lead,
    path: `/hearing-aids/type/${type}`,
  });
}

export default async function TypeHubPage({ params }: PageParams) {
  const { locale: rawLocale, type } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(rawLocale);
  if (!FORM_TYPES.includes(type as FormType)) notFound();
  const hub = getTypeHub(type as FormType, locale);
  if (!hub) notFound();
  return <HubPage locale={locale} path={`/hearing-aids/type/${type}`} content={hub.content} match={hub.match} />;
}
