# SheRISE

A two-sided platform for a nonprofit skill-training and reintegration
program for women returning from correctional and rehabilitation centres in
Nigeria: a participant community + training app, and an admin/M&E dashboard
for staff, trainers, and sponsors.

**Start here:** [`BUILD_STATUS.md`](./BUILD_STATUS.md) — what's built, what's
stubbed, what's not started, and how to run it. The full locked spec is in
[`docs/BUILD_PROMPT.md`](./docs/BUILD_PROMPT.md); the design handoff
(tokens, screen inventory, principles, and a browsable HTML prototype) is in
[`docs/design-handoff/`](./docs/design-handoff/).

## Quick start

```bash
npm install
```

### Database setup (PostgreSQL)

The app requires a Postgres database (local or Supabase). Point it at one via
`DATABASE_URL`:

```bash
# Local Postgres example (adjust user/password/db name to your setup):
createdb sherise
export DATABASE_URL="postgresql://postgres:sherise_dev_pw@localhost:5432/sherise"
```

Or copy `.env.example` to `.env.local` and set `DATABASE_URL` there. The
schema loads automatically on first request (`src/lib/db.ts` runs
`src/lib/schema.sql` against the target database on first query), so no
separate migration command is required — but you can also load it explicitly:

```bash
psql "$DATABASE_URL" -f src/lib/schema.sql
```

For **Supabase**: create a project, copy its connection string (Project
Settings → Database → Connection string → URI, using the pooled/`pgbouncer`
port for serverless deploys) into `DATABASE_URL`, then either let the app
auto-load the schema on first request or run
`psql "$DATABASE_URL" -f src/lib/schema.sql` yourself.

```bash
npm run dev
```

Open http://localhost:3000. Demo data seeds automatically on first request.

## Demo credentials

All seeded on first request against whatever database `DATABASE_URL` points
to. Passwords are for local/demo use only — rotate before any real deploy.

| Role | Identifier | Password | Sign in at |
|---|---|---|---|
| Admin | `admin@sherise.org` | `password123` | `/admin/login` |
| Sponsor | `sponsor@bluesapphire.ng` | `password123` | `/admin/login` |
| Trainer | any seeded trainer email, e.g. `titilayo@sherise.org` | `password123` | `/admin/login` |
| Participant | `08100000001` (fixed/stable — hardcoded in `src/lib/seed.ts`, survives reseeds) | `password123` | `/login` |

## Deploying the two surfaces separately

This is one Next.js codebase serving two logical products — the participant
app and the staff/admin dashboard — split at request time by
`src/middleware.ts` reading `NEXT_PUBLIC_APP_SURFACE`:

- Deploy once with `NEXT_PUBLIC_APP_SURFACE=participant` → bind to
  `sherise.com`. All `/admin/*` routes 404 on this deployment.
- Deploy again with `NEXT_PUBLIC_APP_SURFACE=admin` → bind to
  `sherise-admin.com`. Every non-admin route redirects to `/admin/login`.
- Leave `NEXT_PUBLIC_APP_SURFACE` unset for local dev to reach both surfaces
  from one running instance.

Both deployments share the same `DATABASE_URL` — the split is purely at the
routing layer, not the data layer.

## Stack

- Next.js App Router (TypeScript, Tailwind v4) — one codebase for both the
  participant app and the admin dashboard, split by the
  `NEXT_PUBLIC_APP_SURFACE` env var + `src/middleware.ts` for separate
  deployment to `sherise.com` / `sherise-admin.com`.
- PostgreSQL via the `postgres` npm package (postgres.js — pure-JS, zero
  native dependencies) for the data layer. See `src/lib/schema.sql` and
  `BUILD_STATUS.md` for migration history (this replaced an earlier
  `better-sqlite3` prototype that failed to load on Windows).
- Design tokens from the locked "Bold & Empowering" system are wired into
  `src/app/globals.css` as CSS custom properties.

## Production build

`npm run build` runs `next build --webpack` — see the Turbopack note in
`BUILD_STATUS.md`.
