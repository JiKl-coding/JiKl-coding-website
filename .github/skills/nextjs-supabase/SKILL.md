---
name: nextjs-supabase
description: 'How we set up and use Supabase in Next.js App Router projects. Use when configuring Supabase auth, creating the server/browser/middleware clients, writing the session-refresh middleware, adding auth guards/redirects, using the service-role admin client, or handling env vars. Covers cookie-based SSR auth with @supabase/ssr, getUser() vs getSession(), and keeping the service-role key server-only.'
user-invocable: false
---

# Supabase Setup & Usage (Next.js App Router)

## When to Use
- Setting up Supabase auth in a new project.
- Creating/editing the Supabase clients or the session middleware.
- Adding auth guards, redirects, or using the admin (service-role) client.
- Reviewing anything that touches auth, cookies, or Supabase env vars.

## The three SSR clients (`@supabase/ssr`)
Cookie-based SSR auth uses **three** clients, each for a different context. Live in `utils/supabase/`.

### Server — `utils/supabase/server.ts`
For Server Components, Route Handlers, Server Actions.
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component — safe to ignore; middleware refreshes sessions.
          }
        },
      },
    }
  );
}
```

### Browser — `utils/supabase/client.ts`
For Client Components.
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Admin (service-role) — `utils/supabase/supabaseAdmin.ts`
**Server-only.** Bypasses RLS — never import into client code.
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

## Session-refresh middleware
Root `middleware.ts` delegates to a helper that refreshes the session on every request and can guard routes.

`middleware.ts`:
```typescript
import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Match everything except static assets & images
    '/((?!_next/static|_next/image|favicon\\.ico|logos/|placeholders/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
```

`utils/supabase/middleware.ts` (the critical parts):
```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options, secure: true, sameSite: 'lax', httpOnly: false, path: '/',
            }));
        },
      },
    }
  );

  // IMPORTANT: do NOT run code between createServerClient and getUser(),
  // and do NOT remove getUser() — omitting it randomly logs users out.
  const { data: { user } } = await supabase.auth.getUser();

  // Route guard example
  if (!user && request.nextUrl.pathname.startsWith('/profil')) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    return NextResponse.redirect(url);
  }

  // IMPORTANT: return supabaseResponse as-is. If you build a new response,
  // copy its cookies over (myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())),
  // or the browser/server sessions desync and sessions terminate early.
  return supabaseResponse;
}
```

### Rules that prevent random logouts
- Never insert logic between `createServerClient(...)` and `auth.getUser()`.
- Never remove `auth.getUser()` from the middleware.
- Always return the `supabaseResponse` (or copy its cookies onto any replacement).

## Getting the current user (authorization)
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) { /* redirect or 401 */ }
```
Always use `getUser()` for authorization (it validates with the auth server). `getSession()` only reads local cookies — do not gate access on it.

## Env vars
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — **server-only**, never exposed to the client.
- `DATABASE_URL` / `DIRECT_URL` — for Prisma (see the `nextjs-prisma` skill).

## Supabase vs. Prisma on the same DB
When both hit the same database, Prisma is usually the primary data layer and Supabase is used mainly for Auth. Beware: Supabase/PostgREST returns **raw DB column/enum values**, while Prisma applies `@map()` translations — values can differ between the two paths. Normalize when reading via the Supabase client.

## Review checklist
- [ ] Three clients in `utils/supabase/` (server, browser, admin) used in the right contexts.
- [ ] Service-role key never reaches client code.
- [ ] Middleware keeps `getUser()` immediately after `createServerClient` and returns `supabaseResponse`.
- [ ] Authorization uses `getUser()`, not `getSession()`.
- [ ] Matcher excludes static assets.
