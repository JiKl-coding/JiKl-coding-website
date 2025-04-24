// app/[locale]/layout.tsx
import { JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { notFound } from "next/navigation";
import "../globals.css";
import Header from "@/components/partials/Header";
import Footer from "@/components/partials/Footer";
import type { Metadata } from "next";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const SERVER_URL = "https://jikl-coding.com";
const APP_NAME = "JiKl-Coding";

const locales = ["cs", "en"];

const metadataByLocale = {
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const content = metadataByLocale[locale as "cs" | "en"] ?? metadataByLocale.cs;
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
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) notFound();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${jetBrainsMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          {children}
          <Footer locale={locale as "cs" | "en"} />
        </ThemeProvider>
      </body>
    </html>
  );
}

export async function generateStaticParams() {
  return [{ locale: "cs" }, { locale: "en" }];
}
