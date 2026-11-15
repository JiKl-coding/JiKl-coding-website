---
name: nextjs-i18n
description: 'How we internationalize Next.js App Router apps. Use when a project needs multiple languages, translations, locale routing, or when tempted to hardcode user-facing strings. Uses the native [lang] route segment + typed JSON dictionaries (dictionaries/cs.json, en.json), a server-only getDictionary loader, generateStaticParams, a LangSwitcher, and locale detection in middleware. Also covers single-language projects that only need locale formatting.'
user-invocable: false
---

# Internationalization (i18n)

## When to Use
- A project must support more than one language.
- Adding/adjusting translations, locale routing, or a language switcher.
- Anytime you are about to hardcode a user-facing string in a multilingual app.

> **Not every project is multilingual.** Some intentionally hardcode one language and only use `toLocaleString`/`localeCompare`/`toLocaleDateString('cs-CZ')` for formatting. Detect what the project already does before adding i18n machinery. The rest of this skill is for when translations are required.

## Core rules
- **No hardcoded user-facing strings** in components — every label/title/button/message comes from a dictionary.
- **Locale lives in the URL**: `/[lang]/...` (`/cs/kontakt`, `/en/contact`) — SEO-friendly and shareable.
- **Dictionaries are typed and server-loaded**; strings pass to client components as props.
- **Single source of truth** per language; every locale file has the **same key shape**.

## File layout
```
dictionaries/
  cs.json                 # nested by feature
  en.json                 # identical key shape
app/[lang]/
  dictionaries.ts         # typed loader (server-only)
  layout.tsx              # generateStaticParams + locale guard
  page.tsx
components/LangSwitcher.tsx
middleware.ts             # detects locale, redirects, sets x-locale
```

## Dictionaries (nested JSON, grouped by feature)
```json
// dictionaries/cs.json
{
  "nav": { "work": "Má práce", "about": "O mně", "contact": "Kontakt" },
  "contact": { "heading": "Kontakt", "formName": "Vaše jméno" }
}
```
`en.json` mirrors the exact same keys.

## Typed loader — `app/[lang]/dictionaries.ts`
```typescript
import "server-only";

const dictionaries = {
  cs: () => import("../../dictionaries/cs.json").then((mod) => mod.default),
  en: () => import("../../dictionaries/en.json").then((mod) => mod.default),
};

export type Locale = keyof typeof dictionaries;
export const hasLocale = (locale: string): locale is Locale => locale in dictionaries;
export const getDictionary = async (locale: Locale) => dictionaries[locale]();
```
`server-only` keeps dictionaries out of the client bundle; `Locale`/`hasLocale` give type safety + 404 handling.

## Locale layout — `app/[lang]/layout.tsx`
```typescript
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "./dictionaries";

export async function generateStaticParams() {
  return [{ lang: "cs" }, { lang: "en" }];
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <>{children}</>;
}
```
Localize metadata too: load the dict in `generateMetadata`, use `dict.meta.*` and an OG `locale` (`cs_CZ`/`en_US`).

## Using strings in a page
```typescript
export default async function ContactPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return <ContactClient t={dict.contact} lang={lang} />;
}
```
Server component loads the dictionary; client components receive the slice as a `t` prop. Never import dictionaries into client components.

## Language switcher — `components/LangSwitcher.tsx`
Swap only the locale segment so the user stays on the same page:
```typescript
"use client";
import { usePathname, useRouter } from "next/navigation";

export default function LangSwitcher({ lang }: { lang: string }) {
  const pathname = usePathname();
  const router = useRouter();
  function switchTo(target: string) {
    const segments = pathname.split("/");
    segments[1] = target;              // replace [lang]
    router.push(segments.join("/"));
  }
  // render buttons highlighting the active `lang`
}
```

## Locale detection in middleware
Detect from `Accept-Language`, redirect locale-less paths, forward the resolved locale. Skip `/admin` and `/api`.
```typescript
const locales = ["cs", "en"] as const;
const defaultLocale = "cs";

function getLocale(request: NextRequest) {
  const header = request.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const lang = part.split(";")[0].trim().toLowerCase();
    if (lang.startsWith("cs") || lang.startsWith("sk")) return "cs";
    if (lang.startsWith("en")) return "en";
  }
  return defaultLocale;
}
// if path lacks a locale prefix and isn't /admin|/api → redirect to `/${locale}${pathname}`;
// else set an `x-locale` header (and forward theme cookie as `x-theme`) and continue.
```

## Review checklist
- [ ] No hardcoded user-facing strings — all via dictionaries.
- [ ] Every locale file has identical key shape.
- [ ] Dictionary loading is `server-only`; client gets strings as props.
- [ ] Unknown locales `notFound()`; `generateStaticParams` lists all locales.
- [ ] Metadata (title/description/OG locale) localized.
- [ ] `LangSwitcher` preserves the current path.
- [ ] Middleware skips `/admin` and `/api`, redirects locale-less paths.
