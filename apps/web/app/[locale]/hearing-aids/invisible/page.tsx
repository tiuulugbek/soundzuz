import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "../../../../i18n/routing";
import { buildPageMetadata } from "../../../../lib/seo";
import { getFeatureHub } from "../../../../lib/catalog-hubs";
import { HubPage } from "../../../../components/catalog/hub-page";
import "../catalog.css";
import "../hub.css";

const HUB = "invisible" as const;
const PATH = `/hearing-aids/${HUB}`;
export const revalidate = 300;

type PageParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  const hub = getFeatureHub(HUB, locale as Locale);
  if (!hub) return {};
  return buildPageMetadata({ locale: locale as Locale, title: hub.content.title, description: hub.content.lead, path: PATH });
}

export default async function Page({ params }: PageParams) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(rawLocale);
  const hub = getFeatureHub(HUB, locale);
  if (!hub) notFound();
  return <HubPage locale={locale} path={PATH} content={hub.content} match={hub.match} />;
}
