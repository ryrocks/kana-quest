import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import KanaQuest from "../KanaQuest";
import { isLocale, LOCALES, MESSAGES, OG_LOCALES } from "../i18n";

type PageProps = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: candidate } = await params;
  if (!isLocale(candidate)) return {};
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;
  const { title, description } = MESSAGES[candidate].meta;
  return {
    title,
    description,
    alternates: { canonical: `${protocol}://${host}/${candidate}`, languages: Object.fromEntries(LOCALES.map((locale) => [locale, `${protocol}://${host}/${locale}`])) },
    openGraph: { title, description, type: "website", locale: OG_LOCALES[candidate], images: [{ url: image, width: 1731, height: 909, alt: "Kana Quest — あ / ア" }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function LocalizedGame({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <KanaQuest locale={locale} />;
}
