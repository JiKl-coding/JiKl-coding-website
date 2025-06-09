// app/[locale]/layout.tsx
import { JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { notFound } from "next/navigation";
import "../globals.css";
import Header from "@/components/partials/Header";
import Footer from "@/components/partials/Footer";
import { getPersonStructuredData } from "@/lib/seo/structuredData";
import { getLocalizedMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { CookieBar, GtagInitScript } from "@jikl/lib";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const locales = ["cs", "en"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return getLocalizedMetadata(locale as "cs" | "en");
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

  const ldJson = getPersonStructuredData(locale as "cs" | "en");

  const gaTrackingId = process.env.GA_TRACKING_ID || "";

  const cookieTexts = {
    cs: {
      messageText: "K analýze návštěvnosti využívám službu Google Analytics. Cookies ukládám jen s vaším souhlasem.",
      acceptLabel: "Souhlasím",
      denyLabel: "Odmítám",
    },
    en: {
      messageText: "I use Google Analytics to analyze traffic. Cookies are only stored with your consent.",
      acceptLabel: "I agree",
      denyLabel: "I decline",
    },
  };


  return (
    <html lang={locale} suppressHydrationWarning>
       <head>
        <GtagInitScript gtagId={gaTrackingId} />
      </head>
      <body className={`${jetBrainsMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Header />
          {children}
          <Footer locale={locale as "cs" | "en"} />
          <CookieBar
            gtagId={gaTrackingId}
            className="fixed bottom-0 inset-x-0 w-full min-h-[80px] bg-[var(--cookies)] text-[var(--foreground)] z-50 shadow-md border-t border-[var(--link)]"
            messageText={cookieTexts[locale as "cs" | "en"].messageText}
            messageClassName="px-2 sm:text-base text-xs"
            buttonAcceptLabel={cookieTexts[locale as "cs" | "en"].acceptLabel}
            buttonDenyLabel={cookieTexts[locale as "cs" | "en"].denyLabel}
            buttonWrapperClassName="flex justify-end items-center gap-2 px-2 sm:text-sm text-xs flex-wrap"
            buttonAcceptClassName="p-2 min-w-[90px] rounded-md bg-[var(--link)] border border-[var(--link)] text-[var(--background)] before:duration-300 hover:text-[var(--background)] hover:border-[var(--foreground)] hover:bg-[var(--foreground)]"
            buttonDenyClassName="p-2 min-w-[90px] rounded-md bg-[var(--background)] border border-[var(--foreground)] text-[var(--foreground)] before:duration-300 hover:text-[var(--background)] hover:border-[var(--background)] hover:bg-[var(--foreground)]"
          />
        </ThemeProvider>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />
      </body>
    </html>
  );
}

export async function generateStaticParams() {
  return [{ locale: "cs" }, { locale: "en" }];
}
