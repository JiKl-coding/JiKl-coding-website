---
name: jikl-new-project
description: 'The single step-by-step recipe for bootstrapping a brand-new JiKl Next.js project — create-next-app (pinned version, our preferred answers), base files (constants, .env, clean public/), layout.tsx metadata (built-in Metadata API) + fonts, Supabase clients + Prisma, design tokens / themes / i18n, env vars, first build, first Git/GitHub push and project operations. Use when creating a new Next.js project from scratch or when the owner runs /jikl-new-project.'
user-invocable: true
---

# Bootstrapping a new JiKl Next.js project

The one recipe for standing up a fresh Next.js project with our structure, constants, SEO, backend and themes. Run the steps in order and **skip the ones the owner doesn't want** (ask at the start: Supabase? Prisma? multiple languages? light/dark themes?). Deeper conventions live in the skills linked from each step.

## 1. Create the app (pinned version)
```bash
npm view create-next-app time --json      # pick the newest stable version that is ≥ ~7 days old
npx create-next-app@<that version> <project_name> --skip-install
cd <project_name>
npm install --ignore-scripts --before=<YYYY-MM-DD, ~7 days ago>
```
Don't use `@latest` – it runs whatever was published minutes ago. Version policy and safe installs: `jikl-dependency-updates`. Install every later package the same way (`--ignore-scripts --before=…`).

Preferred answers:

| Prompt | Answer |
|--------|--------|
| TypeScript? | ✅ Yes |
| ESLint? | ✅ Yes |
| Tailwind CSS? | ✅ Yes |
| `src/` directory? | ❌ No |
| App Router? | ✅ Yes |
| Turbopack? | ✅ Yes (the default since Next 16; fall back to `--webpack` only if a plugin/loader needs it) |
| Customize import alias? | ✅ Yes → `@` |

Then set the branch name:
```bash
git branch -M main
```

## 2. Base files (write them yourself)
Ask the owner for the app name, a one-line description and the production URL, then:

- **`lib/constants/index.ts`** — the app-wide constants, read from public env vars with fallbacks:
  ```ts
  export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "<App name>";
  export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION ?? "<One-line description>";
  export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";
  export const DEFAULT_LOCALE = "cs";
  ```
- **`.env`** — `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_DESCRIPTION`, `NEXT_PUBLIC_SERVER_URL` (public values only; secrets come in step 7).
- **`public/`** — delete the default create-next-app assets (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`) and put a custom `favicon.ico` in `app/` (e.g. from https://favicon.io/).
- **Folders** — create them when the first file needs them (`components/`, `lib/…`, `utils/`, `docs/`; layout: `nextjs-project-structure`). No empty folders with `.gitkeep`.

## 3. `app/layout.tsx` — metadata + fonts
Set `<html lang="cs">` (or the project's language), load fonts, and export the site-wide metadata. Write `lib/seo/metadata.ts` (`rootMetadata` + `pageMetadata()`) from `nextjs-seo` first — no helper library:
```tsx
import "./globals.css";
import { Roboto, Noto_Color_Emoji } from "next/font/google";
import type { Metadata } from "next";
import { rootMetadata } from "@/lib/seo/metadata";

// Kept on --font-geist-sans so the font variables in the generated globals.css keep working.
const roboto = Roboto({ variable: "--font-geist-sans", subsets: ["latin"] });
const notoEmoji = Noto_Color_Emoji({
  variable: "--font-noto-emoji", subsets: ["emoji"], display: "swap",
  fallback: ["system-ui", "sans-serif"], weight: "400",
});

export const metadata: Metadata = rootMetadata;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="cs">
      <body className={`${roboto.variable} ${notoEmoji.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

Smoke-test home page `app/page.tsx` (verifies Tailwind, the `@` alias, `.env` → constants and the layout):
```tsx
import { APP_NAME } from "@/lib/constants";

export default function HomePage() {
  return (
    <main className="flex items-start justify-center h-screen">
      <h1 className="text-4xl font-bold">{APP_NAME}</h1>
    </main>
  );
}
```

SEO basics from the start (`nextjs-seo`): `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.png` (1200×630), `app/icon.png` / `app/apple-icon.png`. Analytics + cookie consent only if the owner wants GA.

## 4. Supabase (if used)
```bash
npm i @supabase/supabase-js @supabase/ssr --ignore-scripts --before=<YYYY-MM-DD, ~7 days ago>
```
Create the clients in `utils/supabase/` (server, client, middleware, admin) + the root `middleware.ts` session refresh — follow `nextjs-supabase`.

## 5. Prisma (if used)
```bash
npm i @prisma/client --ignore-scripts --before=<YYYY-MM-DD, ~7 days ago>
npm i -D prisma --ignore-scripts --before=<YYYY-MM-DD, ~7 days ago>
npx prisma init
```
Set `DATABASE_URL` (pooled) + `DIRECT_URL` (direct), add the client singleton in `lib/prisma/client.ts`, define models, then `npx prisma db push` (or `migrate dev`) → `npx prisma generate` — follow `nextjs-prisma`.

## 6. Design tokens, themes, languages
- **Tokens (always):** semantic CSS variables in `app/globals.css` (`--background`, `--foreground`, `--text-color`, `--text-color-2`, `--accent-color`, `--border-color`, `--alert-color`, `--shadow-color`), never hardcoded colors — `nextjs-theming`.
- **Light/dark (optional):** `next-themes`:
  ```bash
  npm i next-themes --ignore-scripts --before=<YYYY-MM-DD, ~7 days ago>
  ```
  ```tsx
  <ThemeProvider attribute="class" defaultTheme="light" themes={["dark", "light"]} enableSystem>
    <Header />
    <main>{children}</main>
    <Footer />
  </ThemeProvider>
  ```
  Add a `SimpleThemeSwitcher` to toggle — details in `nextjs-theming`.
- **Multiple languages (optional):** `[lang]` segment + dictionaries — `nextjs-i18n`.

## 7. Env vars
- `.env` (step 2): public `NEXT_PUBLIC_APP_*` / `NEXT_PUBLIC_SERVER_URL`.
- Secrets in the env file the project's tooling reads (never committed): Supabase URL + anon key (`NEXT_PUBLIC_SUPABASE_*`), `SUPABASE_SERVICE_ROLE_KEY` (**server-only**), `DATABASE_URL`, `DIRECT_URL`. Where Prisma reads them from: `nextjs-prisma`.
- Make sure `.gitignore` covers the env files with secrets.

## 8. Verify the build
```bash
npm run lint
npm run build
```

## 9. First commit, GitHub, operations
```bash
git add .
git commit -m "feat: initial project setup"
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```
Right after the first push: Dependabot, the Claude analysis workflow and jikl-admin registration — `jikl-project-ops`.

## Related skills
- `nextjs-project-structure` — where files go, App Router conventions, the API route pattern.
- `nextjs-supabase`, `nextjs-prisma`, `nextjs-theming`, `nextjs-i18n` — the details behind steps 4–6.
- `nextjs-seo` — page metadata, OG images/icons, sitemap/robots, JSON-LD, cookie consent + Google Analytics.
- `jikl-dependency-updates` — package versions and safe installs.
- `jikl-project-ops` — repo operations after the first push.
