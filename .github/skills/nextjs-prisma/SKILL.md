---
name: nextjs-prisma
description: 'How we set up and use Prisma in Next.js projects (typically with a Supabase-hosted Postgres). Use when configuring the Prisma client singleton, editing schema.prisma, choosing between db push and migrate dev, running migrations, mapping columns/enums with @map, or wiring DATABASE_URL/DIRECT_URL. Covers avoiding hot-reload connection exhaustion and the @map translation gotcha vs Supabase/PostgREST.'
user-invocable: false
---

# Prisma Setup & Usage

## When to Use
- Setting up Prisma in a project or adding the client singleton.
- Editing `schema.prisma`, adding models/enums, or running migrations.
- Deciding between `db push` and `migrate dev`.
- Anything touching `DATABASE_URL` / `DIRECT_URL` or `@map`.

## Client singleton — `lib/prisma/client.ts`
Prevents exhausting DB connections during dev hot-reload:
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```
Always import this singleton; never `new PrismaClient()` per request.

## Schema — `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // pooled (PgBouncer) connection — runtime
  directUrl = env("DIRECT_URL")     // direct connection — migrations
}
```
- Use `@map()` / `@@map()` to map fields/models/enum values to different DB names.
- Prisma translates `@map()` transparently in its client. **Other clients (Supabase/PostgREST) see the raw mapped values** — normalize when reading the same DB via Supabase.

## Commands
```bash
npx prisma generate        # Regenerate the client after any schema change (always run this)
npx prisma db push         # Push schema without a migration — fast iteration / prototyping
npx prisma migrate dev     # Create + apply a tracked migration (versioned history)
npx prisma migrate deploy  # Apply migrations in production/CI
npx prisma studio          # Visual DB browser
```
- Prefer `db push` while iterating and history doesn't matter yet.
- Switch to `migrate dev` once the schema should be versioned.
- Run `prisma generate` after **every** schema change (types go stale otherwise).

## Env vars
- `DATABASE_URL` — pooled connection (Supabase pooler / PgBouncer), used at runtime.
- `DIRECT_URL` — direct connection, used for migrations.

## Review checklist
- [ ] All DB access goes through the `lib/prisma/client.ts` singleton.
- [ ] `datasource` has both `url` (pooled) and `directUrl` (direct).
- [ ] `prisma generate` run after schema changes.
- [ ] `@map` differences accounted for if the DB is also read via Supabase.
