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
- `@jikl/lib` was **removed 2026-11-15** (replaced per `nextjs-seo` §6). GA + consent bar = `components/analytics/Analytics.tsx` (server env `GA_TRACKING_ID` passed as `gaId` prop, labels from `translations.*.cookieBar`; localStorage key `cookie_consent` = `"true"`/`"false"` kept from the old lib; GA script loads only after accept — no Consent Mode). JSON-LD rendered via `components/seo/JsonLd.tsx` (escapes `<`).
- `next-sitemap` runs on `postbuild` and writes `public/sitemap.xml`, `public/sitemap-0.xml`, `public/robots.txt` (these are committed, regenerated on every build).
- Font: JetBrains Mono via `next/font/google` → `--font-jetbrains`, monospace everywhere.
- Scripts: `npm run dev | build | start | lint` (`next lint`). No tests.

## Layout
```
app/layout.tsx                 root: only `metadata` (from lib/constants env) + returns <>{children}</> (no <html>!)
app/[locale]/layout.tsx        real <html lang>/<body>, ThemeProvider, Header, Footer, <Analytics>, <JsonLd> Person; generateStaticParams cs/en; notFound for others
app/[locale]/page.tsx          → <HomePageContent t={translations[locale]} />
app/[locale]/privacy-policy    reads public/<locale>/docs/{gdpr|privacy-policy}.md via fs, renders with ReactMarkdown in .prose
app/[locale]/terms-of-service  reads public/<locale>/docs/{obchodni-podminky|terms-of-service}.md
app/api/send-email/route.ts    POST {name,email,message,website(honeypot)} → validate + escapeHtml → Resend (RESEND_FROM → RESEND_TO, replyTo = sender); checks Resend's `{ error }` result
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
- Keys: hero, about, nav, services (+`cta`), projects, contact, contactForm, cookieBar, footer (+`privacy`). Remaining inline ternaries `locale === 'cs' ? … : …`: ProjectCard "Klikni na mě", Header aria-labels, ToggleButton cze/eng — move into `lib/i18n.ts` when touched.

## Theming (project-specific)
- Tokens in `app/globals.css`: `--background`, `--foreground`, `--link`, `--cookies`; `.dark` overrides (next-themes class). No `prefers-color-scheme` media query (removed — it broke the light theme for dark-OS users). Used as `bg-[var(--background)]` etc.
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
Removing a project = reverse: delete the image, the i18n keys in both locales and the array entry.

## Env vars (`.env`, gitignored; same set on Vercel)
`NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_DESCRIPTION`, `NEXT_PUBLIC_SERVER_URL`, `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_TO`, `GA_TRACKING_ID`.

## Build on Windows: drive J: is exFAT
`next build` fails on J: with `EISDIR: illegal operation on a directory, readlink '…route.ts'` (webpack + exFAT). Not a code bug — build from an NTFS copy:
`robocopy <project> <scratchpad>uild /MIR /XD .git .next .claude` then `npm run lint` / `npm run build` there. (`next build` on Vercel is fine.)
Pages are SSG → rendered HTML is in `.next/server/app/{cs,en,…}.html` (handy for comparing `<head>`).

## Claude Code gotcha
Git operations that delete+recreate `.claude/` (rebase, checkout across commits adding it) fail with *Permission denied* while a Claude Code session is running — the session holds a handle on `.claude/`, Windows leaves it delete-pending. Avoid touching `.claude/` via git during a session; if it happens, restart the session and run `git checkout -- .claude`.

## Fixed 2026-11-15
Middleware redirect loop for non-cs/en Accept-Language (now validated + exact `/cs` or `/cs/` prefix match); HTML injection / no validation in send-email; dark media query overriding light theme; stale cookbook image + i18n keys; hardcoded Footer/ContactForm/Services/cookie strings → i18n.

## Remaining notes
- `globals.css` is imported in both `app/layout.tsx` and `app/[locale]/layout.tsx`; root `metadata` (env-based) and `getLocalizedMetadata` (hardcoded `https://jikl-coding.com`) duplicate each other.
- Legal `.md` files sit in `public/`, so they are also served raw at `/cs/docs/gdpr.md` etc. Legal texts are dated — update dates when editing them (see commit `cadf5b1`). Privacy texts mention GA consent — keep in sync with `Analytics.tsx`.
- No way to change the cookie choice later yet (could add a footer link that clears `cookie_consent`).
- `.github/` = Copilot mirror of agent + skills (`jikl-agents.lock.json`), plus `dependabot.yml` + `workflows/claude.yml` (jikl-admin, added on remote). Sync agent: `node scripts/agent-converter/agent-convert.mjs --from claude --to copilot`.
