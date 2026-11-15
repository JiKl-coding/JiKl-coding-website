# jikl-next — project knowledge: jikl-coding.com

Detailed notes for the `jikl-next` agent. Summary lives in `.claude/agents/jikl-next.md` → *Project Knowledge*.
Last full study: 2026-11-15 (commit `73795a7`).

## What it is
Personal portfolio + freelance business site of Jiří "Jirka" Klatovský (JiKl-Coding), https://jikl-coding.com.
One-page site (hero → about → services → tech-stack → projects → contact form) + two legal pages. CS + EN.
Repo: `github.com/JiKl-coding/JiKl-coding-website`, deployed on Vercel. Commit messages are short, mostly Czech.

## Stack (actual — differs from the template defaults)
- Next.js **15.3.8** (App Router), React 19, TypeScript strict, Tailwind **v4** (`@import "tailwindcss"`, `@plugin "@tailwindcss/typography"`), PostCSS.
- **No Supabase, no Prisma, no database, no auth.** Skills `nextjs-supabase` / `nextjs-prisma` are irrelevant here.
- `next-themes` (class attribute, `defaultTheme="light"`, `enableSystem`) for dark/light.
- `resend` for the contact form email. `react-markdown` for legal pages. `react-icons`, `clsx`, `cookies-next` (installed, unused).
- `@jikl/lib` (`github:JiKl-coding/jikl-lib`, own library) — only `CookieBar` + `GtagInitScript` are used (GA consent). The `nextjs-seo` skill describes replacing it with project code — do only when asked.
- `next-sitemap` runs on `postbuild` and writes `public/sitemap.xml`, `public/sitemap-0.xml`, `public/robots.txt` (these are committed, regenerated on every build).
- Font: JetBrains Mono via `next/font/google` → `--font-jetbrains`, monospace everywhere.
- Scripts: `npm run dev | build | start | lint` (`next lint`). No tests.

## Layout
```
app/layout.tsx                 root: only `metadata` (from lib/constants env) + returns <>{children}</> (no <html>!)
app/[locale]/layout.tsx        real <html lang>/<body>, ThemeProvider, Header, Footer, CookieBar, GtagInitScript, Person JSON-LD; generateStaticParams cs/en; notFound for others
app/[locale]/page.tsx          → <HomePageContent t={translations[locale]} />
app/[locale]/privacy-policy    reads public/<locale>/docs/{gdpr|privacy-policy}.md via fs, renders with ReactMarkdown in .prose
app/[locale]/terms-of-service  reads public/<locale>/docs/{obchodni-podminky|terms-of-service}.md
app/api/send-email/route.ts    POST {name,email,message} → Resend (RESEND_FROM → RESEND_TO, replyTo = sender)
components/HomePageContent.tsx server; holds the `projects` array (label, image import, href, layout flag, i18n texts) + sr-only SEO text
components/{Hero,Me,Services,Skills}Section.tsx, ProjectCard.tsx (3D flip card), ContactForm.tsx
components/partials/{Header,Footer,HeaderToggle,ToggleButton}.tsx
lib/i18n.ts                    single `translations = { cs, en } as const` object (NOT JSON dictionaries)
lib/seo/metadata.ts            getLocalizedMetadata(locale) — title/desc/keywords/OG/Twitter/canonical/alternates; hardcoded SERVER_URL
lib/seo/structuredData.ts      getPersonStructuredData(locale) — Person JSON-LD
lib/constants/index.ts         APP_NAME / APP_DESCRIPTION / SERVER_URL from NEXT_PUBLIC_* env
middleware.ts                  locale redirect (cookie NEXT_LOCALE → Accept-Language → 'cs')
public/jikl.webp (hero), public/projects/*.webp, public/og-image.png
```

## i18n (project-specific, not the `nextjs-i18n` skill pattern)
- Route segment is **`[locale]`** (not `[lang]`), locales `cs` (default) / `en`, type is just `"cs" | "en"` repeated inline.
- Client components read the locale via `useParams()` and index `translations[locale] ?? translations.cs` directly.
- Language switch (`ToggleButton`): sets `NEXT_LOCALE` cookie + localStorage `lang`, `router.push` to swapped prefix.
- Many strings are still inline ternaries `locale === 'cs' ? … : …` (ContactForm, Footer, ServicesSection button, ProjectCard "Klikni na mě", Header aria-labels, cookie texts in layout). When touching them, prefer moving into `lib/i18n.ts`.
- `translations.*.footer.*` keys exist but Footer mostly ignores them (only `rights` is used); `projects.cookbook` and `footer.cookies` are stale.

## Theming (project-specific)
- Tokens in `app/globals.css`: `--background`, `--foreground`, `--link`, `--cookies`; `.dark` overrides. Used as `bg-[var(--background)]` etc.
- There is **no `@theme inline` mapping**, so classes like `text-muted-foreground`, `bg-card`, `border-border`, `text-primary`, `bg-background` used in components are **no-ops**.
- Hardcoded colors still exist (`text-white`, `text-gray-200`, `bg-black/15`, `shadow-gray-500/40`, SkillsSection `bg-white dark:bg-gray-800 text-gray-900 dark:text-white`).
- Theme toggle writes `THEME` cookie + localStorage, but next-themes itself drives the class.
- No global `cursor: pointer` base rule yet; buttons add `cursor-pointer` manually.
- Signature button style: bordered button with a sliding `before:` fill (`before:translate-x-[-100%]` / `translate-y` → `hover:before:translate-0`) and text inside `<span className="relative z-10">`. Reuse it for new buttons.
- Section style: `<h2 className="text-3xl sm:text-4xl font-bold underline text-center uppercase">`, sections have `id` + `scroll-mt-[120px]` (fixed 100px header). Reveal animation = IntersectionObserver + `translate-x-10 opacity-0 → translate-x-0 opacity-100`.
- Header auto-hides after 3 s of no scroll/click (unless mobile menu open).

## Adding a portfolio project (recurring task)
1. Screenshot → `public/projects/<name>.webp`.
2. `lib/i18n.ts`: add `projects.<key>.{description, stack}` in **both** cs and en.
3. `components/HomePageContent.tsx`: import image, add entry to `projects` (alternate `layout: false` for zig-zag; new items usually go to the top).
4. Optionally add the name to `keywords` in `lib/seo/metadata.ts`.
Removing a project = reverse (and delete the image + i18n keys — last removal of belami cookbook left the image + `projects.cookbook` keys behind).

## Env vars (`.env`, gitignored; same set on Vercel)
`NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_DESCRIPTION`, `NEXT_PUBLIC_SERVER_URL`, `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_TO`, `GA_TRACKING_ID`.

## Known issues / gotchas (found 2026-11-15, not yet fixed)
- **Middleware redirect loop**: a visitor without the `NEXT_LOCALE` cookie whose browser's first Accept-Language is not cs/en (e.g. `de-DE`) gets redirected to `/de/…`, which again "misses a locale" → `/de/de/…` → infinite redirect. Fix: only accept the header value if it is in `['cs','en']`. Also `startsWith('/cs')` matches e.g. `/csfoo`.
- **API route HTML injection**: `name`/`message` are interpolated into the email HTML unescaped; no type/length validation, no rate limit / spam protection.
- `globals.css` `@media (prefers-color-scheme: dark) :root {…}` overrides the light tokens for dark-OS users even when the "light" theme is selected (no `.light` block).
- `globals.css` is imported in both `app/layout.tsx` and `app/[locale]/layout.tsx`; root `metadata` (env-based) and `getLocalizedMetadata` (hardcoded URL) duplicate each other.
- Legal `.md` files sit in `public/`, so they are also served raw at `/cs/docs/gdpr.md` etc. Legal texts are dated — update dates when editing them (see commit `cadf5b1`).
- `.claude/`, `.github/` (Copilot mirror of agent + skills, `jikl-agents.lock.json`) and `scripts/agent-converter/` were imported 2026-11-15 and are still untracked. No `.github/dependabot.yml` / `claude.yml` yet → `jikl-project-ops` not done.
- `.claude/agents/jikl-next.md` ↔ `.github/agents/jikl-next.agent.md` are kept in sync with `node scripts/agent-converter/agent-convert.mjs --from claude --to copilot`.
