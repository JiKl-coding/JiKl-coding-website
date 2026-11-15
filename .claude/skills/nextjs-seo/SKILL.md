---
name: nextjs-seo
description: 'How we do SEO, structured data and analytics consent in Next.js App Router projects — without helper libraries, on the built-in Metadata API. Use when adding or changing page metadata (title, description, OpenGraph, Twitter, canonical, robots), OG images and icons, sitemap.ts / robots.ts, JSON-LD structured data (Person, WebSite, LocalBusiness, Organization), a cookie-consent bar with Google Analytics, or when replacing the old @jikl/lib helpers (generateMetadata, get*StructuredData, CookieBar, GtagInitScript, useDebounce) with project code.'
user-invocable: false
---

# SEO, structured data and analytics consent (Next.js)

We use **Next.js built-ins + a few small files owned by the project** (`lib/seo/…`, `components/analytics/…`). No helper library: the code is short, typed by `next`, and moves with the Next version. First check what the project already has and match it.

Constants come from `lib/constants/index.ts` (`APP_NAME`, `APP_DESCRIPTION`, `SERVER_URL`, `DEFAULT_LOCALE`) — see `jikl-new-project`.

## 1. Metadata

Root defaults once in `app/layout.tsx`; pages only add what differs. `metadataBase` makes every relative URL (OG image, canonical) absolute.

`lib/seo/metadata.ts`:
```ts
import type { Metadata } from "next";
import { APP_NAME, APP_DESCRIPTION, SERVER_URL } from "@/lib/constants";

export const OG_LOCALE = "cs_CZ";

// Next merges metadata shallowly: a page's `openGraph` replaces the layout's one completely,
// so every page spreads these defaults back in (see pageMetadata).
const baseOpenGraph = { type: "website", siteName: APP_NAME, locale: OG_LOCALE } as const;
const baseTwitter = { card: "summary_large_image" } as const;

/** Site-wide defaults – export from app/layout.tsx. */
export const rootMetadata: Metadata = {
  metadataBase: new URL(SERVER_URL),
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  openGraph: { ...baseOpenGraph, url: "/" },
  twitter: baseTwitter,
  alternates: { canonical: "/" },
};

type PageMeta = { title: string; description?: string; path: string; image?: string; noIndex?: boolean };

/** Per-page metadata: canonical + OG/Twitter in one place. */
export function pageMetadata({ title, description, path, image, noIndex }: PageMeta): Metadata {
  const images = image ? [{ url: image }] : undefined; // relative -> resolved against metadataBase
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...baseOpenGraph, title, description, url: path, images },
    twitter: { ...baseTwitter, title, description, images: image ? [image] : undefined },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}
```

Use:
```tsx
// app/layout.tsx
import { rootMetadata } from "@/lib/seo/metadata";
export const metadata = rootMetadata;

// app/about/page.tsx (static)
export const metadata = pageMetadata({ title: "O nás", description: "…", path: "/about" });

// app/blog/[slug]/page.tsx (dynamic) — params is a Promise in current Next
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return pageMetadata({ title: post.title, description: post.excerpt, path: `/blog/${slug}` });
}
```
- `generateMetadata` is a **reserved Next export name** — never name your own helper that.
- `themeColor`, `colorScheme` and `viewport` go to a separate `export const viewport: Viewport`, not into metadata.
- Multilingual (`[lang]`, see `nextjs-i18n`): set `alternates.languages` (`{ cs: "/cs/…", en: "/en/…" }`) and the per-language `openGraph.locale`.

## 2. Icons and OG images (file conventions)

Put files into `app/` – Next generates the tags:
- `app/favicon.ico`, `app/icon.png` (or `.svg`), `app/apple-icon.png`
- `app/opengraph-image.png` (1200×630) and optionally `app/twitter-image.png`; a route segment can have its own.
- Generated OG image: `app/opengraph-image.tsx` with `ImageResponse` from `next/og` (export `size`, `contentType`, `alt`).

## 3. Sitemap and robots

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";
import { SERVER_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/about", "/contact"].map((p) => ({ url: `${SERVER_URL}${p}`, lastModified: new Date() }));
  return [...pages /* , ...dynamic entries from the DB */];
}

// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }, sitemap: `${SERVER_URL}/sitemap.xml` };
}
```
Disallow private areas, but **protect them with auth** — robots.txt is not access control.

## 4. Structured data (JSON-LD)

Builders in `lib/seo/structured-data.ts` return plain schema.org objects; one component renders them.

```ts
import { SERVER_URL } from "@/lib/constants";

type Address = { streetAddress?: string; addressLocality: string; postalCode?: string; addressCountry: string };
const postal = (a: Address) => ({ "@type": "PostalAddress", ...a });

export const websiteLd = (name: string) => ({ "@context": "https://schema.org", "@type": "WebSite", name, url: SERVER_URL });

export const personLd = (p: { name: string; jobTitle?: string; description?: string; image?: string; sameAs?: string[]; worksFor?: string; address?: Address }) => ({
  "@context": "https://schema.org", "@type": "Person", url: SERVER_URL,
  name: p.name, jobTitle: p.jobTitle, description: p.description, image: p.image, sameAs: p.sameAs,
  worksFor: p.worksFor ? { "@type": "Organization", name: p.worksFor } : undefined,
  address: p.address ? postal(p.address) : undefined,
});

export const localBusinessLd = (b: { name: string; image?: string; email?: string; telephone?: string; sameAs?: string[]; address: Address; openingHours?: string[] }) => ({
  "@context": "https://schema.org", "@type": "LocalBusiness", url: SERVER_URL,
  name: b.name, image: b.image, email: b.email, telephone: b.telephone, sameAs: b.sameAs,
  address: postal(b.address), openingHours: b.openingHours,
});
```

`components/seo/JsonLd.tsx` (server component):
```tsx
export function JsonLd({ data }: { data: object | object[] }) {
  // escape "<" so content can't close the script tag
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
```
Render it in the page (or the root layout for site-wide entities): `<JsonLd data={[websiteLd(APP_NAME), localBusinessLd({…})]} />`. Only describe what is really on the page. Validate with https://search.google.com/test/rich-results.

## 5. Cookie consent + Google Analytics

EU rule: **no analytics cookies before consent.** We load GA only after "accept" (and remember the choice); without `NEXT_PUBLIC_GA_ID` nothing loads.

`components/analytics/Analytics.tsx`:
```tsx
"use client";
import Script from "next/script";
import { useEffect, useState } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const KEY = "cookie-consent"; // "granted" | "denied"

export function Analytics({ labels }: { labels: { message: string; accept: string; deny: string } }) {
  const [consent, setConsent] = useState<string | null | undefined>(undefined); // undefined = not read yet
  useEffect(() => {
    try { setConsent(localStorage.getItem(KEY)); } catch { setConsent(null); }
  }, []);
  const choose = (value: "granted" | "denied") => {
    try { localStorage.setItem(KEY, value); } catch { /* private mode */ }
    setConsent(value);
  };
  if (!GA_ID) return null;
  return (
    <>
      {consent === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
      {consent === null && (
        <div role="dialog" aria-live="polite" className="fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center gap-3 p-4 bg-[var(--background)] text-[var(--text-color)] border-t border-[var(--border-color)]">
          <p className="flex-1">{labels.message}</p>
          <button onClick={() => choose("denied")} className="cursor-pointer px-4 py-2 border border-[var(--border-color)]">{labels.deny}</button>
          <button onClick={() => choose("granted")} className="cursor-pointer px-4 py-2 bg-[var(--accent-color)] text-[var(--background)]">{labels.accept}</button>
        </div>
      )}
    </>
  );
}
```
Place `<Analytics labels={…} />` at the end of `<body>` in the root layout (labels from the dictionary in multilingual projects). Colors through the project's tokens (`nextjs-theming`). Offer a way to change the choice later (e.g. a "Cookies" link in the footer that clears the key). If the owner needs Google Ads / Consent Mode v2 signals, extend this with `gtag('consent', 'default' | 'update', …)` instead of adding a library.

## 6. Replacing @jikl/lib in an existing project

Only when the owner asks (it's a refactor). Map 1:1, then remove the dependency:

| @jikl/lib | Replacement |
|-----------|-------------|
| `generateMetadata({...})` | `rootMetadata` / `pageMetadata()` (section 1) |
| `getPersonStructuredData`, `getWebsiteStructuredData`, `getLocalBusinessStructuredData` | `personLd`, `websiteLd`, `localBusinessLd` + `<JsonLd>` (section 4) |
| `GtagInitScript` + `CookieBar` | `<Analytics>` (section 5) – keep the existing texts and styling |
| `useDebounce` | a small hook in `lib/hooks/useDebounce.ts` (`useState` + `useEffect` with `setTimeout`/`clearTimeout`) |

Then `npm uninstall @jikl/lib`, `npm run lint && npm run build`, and compare the rendered `<head>` (view source) of a few pages before/after.
