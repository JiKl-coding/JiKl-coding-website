// app/[locale]/page.tsx
import HomePageContent from "@/components/HomePageContent";
import { translations } from "@/lib/i18n";
import { getLocalizedMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "cs" | "en" }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return getLocalizedMetadata(locale);
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: "cs" | "en" }>;
}) {
  const { locale } = await params;
  const t = translations[locale] ?? translations.cs;

  return <HomePageContent t={t} />;
}