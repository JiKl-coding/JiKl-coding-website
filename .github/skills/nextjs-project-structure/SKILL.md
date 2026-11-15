---
name: nextjs-project-structure
description: 'How we lay out and build Next.js App Router projects. Use when deciding where a file goes, structuring folders (app/components/lib/types/utils), writing an API route handler or a page/layout, or following the Server/Client Component split. Covers domain-based grouping, the standard API route pattern and build/dev commands. For bootstrapping a brand-new project use jikl-new-project.'
user-invocable: false
---

# Next.js Project Structure & Setup

## When to Use
- Deciding where a new file/folder belongs.
- Writing an API route handler or a page/layout.
- Reviewing the Server vs Client Component split.

## Standard layout (App Router)
```
app/                 # routes, layouts, pages, API handlers
  layout.tsx         # root layout
  page.tsx           # home route
  globals.css        # Tailwind + CSS variable theme definitions (see nextjs-theming)
  (group)/           # route groups
  [slug]/            # dynamic routes
  api/<domain>/route.ts   # route handlers, grouped by domain
components/          # React components, grouped by feature/domain (not by type)
lib/                 # non-UI logic
  prisma/client.ts   # Prisma singleton (see nextjs-prisma)
  functions/         # pure functions, auth guards, business logic
  data/              # data fetchers
  hooks/             # client-side React hooks
  utils/             # small utilities
  constants/         # shared constants / label maps
prisma/schema.prisma # models + enums
types/               # shared TypeScript types
utils/supabase/      # Supabase clients: server.ts, client.ts, middleware.ts, supabaseAdmin.ts (see nextjs-supabase)
public/              # static assets
middleware.ts        # Next.js middleware (Supabase session refresh / locale)
```
Group `components/` and `app/api/` **by domain**, not by technical type. Keep pure logic in `lib/` out of components.

## Server vs Client Components
- **Server Components** (pages/layouts): run auth guards → fetch data → render. Keep data fetching and secrets server-side.
- **Client Components** (`"use client"`): receive data as props; handle interactivity and browser APIs.
- Never leak service-role keys or server logic into client components.

## API route handler pattern — `app/api/<domain>/route.ts`
```typescript
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma/client';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    // validate input, then Prisma operations scoped to the authenticated user
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
```
- Always validate/authorize at the boundary.
- Never trust client-supplied IDs for ownership — scope every query to the authenticated user.

## Build & dev commands
```bash
npm run dev      # dev server
npm run build    # production build — run after significant changes
npm run lint     # lint
npm start        # run the production build
```
Confirm the actual scripts in `package.json` before running.

## Starting a new project
Use the `jikl-new-project` skill (or `/jikl-new-project`) — the single bootstrap recipe: create-next-app, base files + SEO, Supabase + Prisma, tokens/themes/i18n, env, first push. Don't keep a second checklist here.
