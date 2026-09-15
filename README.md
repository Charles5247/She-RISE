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
npm run dev
```

Open http://localhost:3000. Demo data seeds automatically on first request.
Admin login: `admin@sherise.org` / `password123` at `/admin/login` (API-only
right now — see BUILD_STATUS.md).

## Stack

- Next.js App Router (TypeScript, Tailwind v4) — one codebase for both the
  participant app and the admin dashboard, split by the
  `NEXT_PUBLIC_APP_SURFACE` env var + `src/middleware.ts` for separate
  deployment to `sherise.com` / `sherise-admin.com`.
- SQLite (`better-sqlite3`) standing in for Supabase/Postgres — see
  `src/lib/schema.sql` header and `BUILD_STATUS.md` for the migration note.
- Design tokens from the locked "Bold & Empowering" system are wired into
  `src/app/globals.css` as CSS custom properties.

## Production build

`npm run build` runs `next build --webpack` — see the Turbopack note in
`BUILD_STATUS.md`.
