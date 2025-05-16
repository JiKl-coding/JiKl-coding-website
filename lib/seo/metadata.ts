import type { Metadata } from "next";

const SERVER_URL = "https://jikl-coding.com";
const APP_NAME = "JiKl-Coding";

type Locale = "cs" | "en";

type MetadataLocaleContent = {
  title: string;
  description: string;
  keywords: string;
  locale: string;
};

const metadataByLocale: Record<Locale, MetadataLocaleContent> = {
  cs: {
    title: "JiKl-Coding | Tvořím weby i aplikace",
    description:
      "Jsem Jirka – programátor, sportovec a stoik. Vyvíjím podnikové aplikace v Progress OpenEdge a moderní weby v Next.js, Reactu a Tailwindu.",
    keywords:
      "Jiří Klatovský, Jirka Klatovský, Klatovský, Trojafotbal, Belamicookbook, Jindrichvosecky, stoicismus, webový design, programátor, vývoj webu, webové stránky, React, Next.js, Tailwind, TypeScript, Supabase, Progress ABL, moderní aplikace, JiKl-Coding, JiKl Coding, JiKl, software vývoj, vytvořím web, vytvořím aplikaci, backend, frontend, full-stack",
    locale: "cs_CZ",
  },
  en: {
    title: "JiKl-Coding | I build websites and apps",
    description:
      "I'm Jirka – programmer, athlete and stoic. I develop enterprise apps in Progress OpenEdge and modern websites with Next.js, React and Tailwind.",
    keywords:
      "Jiri Klatovsky, Jirka Klatovsky, Klatovsky, Trojafotbal, Belamicookbook, Jindrichvosecky, stoicism, web design, developer, web development, websites, React, Next.js, Tailwind, TypeScript, Supabase, Progress ABL, modern apps, JiKl-Coding, JiKl Coding, JiKl, software engineering, create web, create application, backend, frontend, full-stack",
    locale: "en_US",
  },
};

export function getLocalizedMetadata(locale: Locale): Metadata {
  const content = metadataByLocale[locale] ?? metadataByLocale.cs;
  const url = `${SERVER_URL}/${locale}`;

  return {
    title: content.title,
    description: content.description,
    keywords: content.keywords,
    metadataBase: new URL(SERVER_URL),
    alternates: {
      canonical: url,
      languages: {
        cs: `${SERVER_URL}/cs`,
        en: `${SERVER_URL}/en`,
      },
    },
    openGraph: {
      title: content.title,
      description: content.description,
      url,
      siteName: APP_NAME,
      type: "website",
      locale: content.locale,
      images: [
        {
          url: `${SERVER_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: content.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.description,
      images: [`${SERVER_URL}/og-image.png`],
    },
    authors: [
      { name: "Jiří Klatovský – JiKl-Coding", url: SERVER_URL },
    ],
    publisher: "Jiří Klatovský – JiKl-Coding",
    creator: "Jiří Klatovský – JiKl-Coding",
  };
}
