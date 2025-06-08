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
import { CookieBar } from "@jikl/lib";
import { GA_TRACKING_ID } from "@/lib/constants";

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

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${jetBrainsMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Header />
          {children}
          <Footer locale={locale as "cs" | "en"} />
          < CookieBar 
            gtagId = {GA_TRACKING_ID} 
            className="fixed bottom-0 inset-x-0 w-full min-h-[70px] bg-[var(--background)] text-[var(--foreground)] z-50 shadow-md border-t border-[var(--foreground)]"
            messageText="K analýze návštěvnosti využívám službu Google Analytics. Cookies ukládám jen s vaším souhlasem."
            messageClassName="px-2 sm:text-sm text-xs"
            buttonClassName="mx-2 bg-[var(--foreground)] border text-[var(--background)] before:duration-300 hover:text-[var(--foreground)] hover:border-[var(--foreground)] hover:bg-[var(--background)]"
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
