# SheRISE — Build Status

This documents exactly what is built, what is stubbed, and what remains,
against the locked spec in `docs/BUILD_PROMPT.md` and the design handoff in
`docs/design-handoff/`. Read this before assuming any screen is finished.

## What "done" means here

Given the size of this spec (two full surfaces, 35 screens, a relational M&E
research dataset, panic-hide, i18n, PWA, cross-post/SMS provider contracts),
this pass prioritized building **the entire backend/data/business-logic layer
for real and end-to-end**, over hand-crafting all 35 pixel-perfect screens.
Every rule in the spec that is about *behavior, data, or access control* is
implemented and testable right now via `curl`. The *screens* are partially
built: auth is wired end-to-end with one real page (`/signup`); the other 34
screens have their APIs fully working but need their UI built against the
design tokens and the `docs/design-handoff/` reference file.

## ✅ Fully implemented and tested

### Data layer (`src/lib/schema.sql`, `src/lib/db.ts`)
Every entity from spec Section 9 exists with the exact field names specified:
`users`, `sponsor_profiles`, `trainer_profiles`, `sessions`, `otp_codes`,
`circles`, `circle_members`, `posts`, `reactions`, `comments`, `pathways`,
`lessons`, `lesson_progress`, `milestones`, `medals`, `trainer_notes`,
`dm_messages`, `notifications`, `referrals`, `survey_responses`,
`export_audit_log`, `broadcasts`, `content_lessons_meta`.

**Engine note:** this runs on SQLite (`better-sqlite3`) instead of
Supabase/Postgres, because no Supabase project credentials exist in this
environment. The schema was written to be a literal 1:1 match to the spec's
Postgres model (same table/field names, same constraints expressed as CHECK)
so swapping the client in `src/lib/db.ts` for a Postgres/Supabase client is a
drop-in migration, not a redesign.

### Access control (`src/lib/access.ts`)
SQLite has no native Row Level Security, so every rule from spec Section 9 is
enforced in this file instead of ad hoc in routes:
- Participants can only read their own `trainer_notes`.
- `last_name` is stripped from every participant-facing/public read (see
  `toPublicUser`, and the explicit per-route handling in `/api/posts`,
  `/api/admin/participants` for sponsors).
- `survey_responses` and `export_audit_log` are only reachable from
  `admin`-scoped routes — never from any participant-facing endpoint.
- Sponsors get aggregate/progress views only — `trainer_notes`, raw
  `survey_responses`, and the enumerator-monitoring block are all excluded for
  that role (see `/api/admin/participants/[id]` and `/api/admin/perception`).
- `withExportAudit()` wraps every `/api/admin/exports` read in the **same
  better-sqlite3 transaction** as the `export_audit_log` insert — if the
  audit write fails, the transaction rolls back and the export fails too.
  Tested: a request without `purpose` is rejected before any data leaves the
  server.

### Auth (`src/lib/auth.ts`, `/api/auth/*`, `/api/admin/login`)
Cookie-based sessions (httpOnly, scrypt-hashed passwords, hashed session
tokens), OTP signup/verify/resend, forgot/reset password, profile completion,
and a separate `/api/admin/login` that rejects `participant`-role accounts
even with correct credentials (staff/trainer/sponsor only). Full flow tested
end-to-end with curl: signup → OTP → session → `/api/auth/me`.

### Deployment surface separation (`src/middleware.ts`, `src/lib/domain.ts`)
Implements the "two domains, one codebase" requirement: set
`NEXT_PUBLIC_APP_SURFACE=participant` on the sherise.com deployment to 404 all
`/admin/*` routes; set it to `admin` on sherise-admin.com to redirect
everything else to `/admin/login`. Unset (local/demo) reaches both.

### Cross-post consent & content filter (`src/lib/crosspost.ts`)
`generateCrosspostCopy()` builds the public caption from **only** the
milestone label + the user's own words, and rejects (`blocked: true`) if the
words "correctional", "reintegration", "rehabilitation", or "program" appear
anywhere in the result — tested against the exact scenario in spec Section 4.
Copy generation happens server-side only (`/api/posts` POST), so the client
can never bypass the filter. Facebook/LinkedIn providers are mocked behind
`FEATURE_CROSSPOST_LIVE` (default `false`, since app review hasn't started
per spec Section 14) but implement the same `send()` interface a real
Graph/Share API client would, and the queue → 30s undo → send lifecycle is
fully wired (`/api/crosspost/[provider]`, `/api/crosspost/[provider]/undo`).

### SMS provider interface (`src/lib/sms.ts`)
`MockSmsProvider` logs instead of calling a real gateway (no provider chosen
yet per spec Section 14) but implements the exact interface
(`sendOtp`, `sendBroadcast`) a real Termii/Africa's Talking client would.

### i18n (`src/i18n/`)
`en.json`, `ha.json`, `yo.json` populated from the spec's starter glossary
verbatim. `ig.json` intentionally left as English fallback with a `_note`
explaining why (no starter glossary exists yet — spec says not to
machine-translate it). `t()` falls back to English for any missing key.

### API surface — all 37 routes from spec Section 10 (and the screen-driving
endpoints beyond it), tested and working:
- Auth: signup, verify-otp, resend-otp, login, logout, me, forgot-password,
  reset-password, complete-profile
- Feed/social: posts (GET paginated + POST), post detail, reactions
  (cheer/hold/celebrate, not likes), comments, notifications (grouped by day)
- Training: pathways, pathway detail, lesson detail, lesson complete
  (awards XP + streak + unlocks next lesson + medal checks)
- Circles: list + join/leave
- Progress: `/api/me/progress` (milestones, streak, medals grid, income log)
- Profile: `/api/me/profile` (GET/PATCH), `/api/me/settings` (GET/PATCH,
  panic-hide default **on**), `/api/me/verify-pin`
- Trainer: `/api/trainers` (participant's assigned trainer), 1:1 DM thread
- Admin: overview (KPIs + top challenges + momentum + map dots), participants
  list + detail (with role-scoped `last_name`/notes visibility), participant
  notes (trainer/admin write), referrals funnel (cumulative counts + drop-off
  %, drop-off reasons, top-LGA conversion, "Signal" insight), perception (full
  Section 8 dataset: geographic coverage, stigma/acceptance, challenges,
  digital skills demand, psychosocial, community readiness, data-quality —
  admin-only), content library, reports list, exports (audited, purpose
  required), broadcasts (SMS mock), trainers & sponsors directory.

### Seed data (`src/lib/seed.ts`)
Runs automatically on first `/api/auth/me` call. Pilot LGA is **Ondo Central**
per spec Section 14, plus 5 nearby Ondo State LGAs for filter/chart variety:
1 admin, 1 sponsor, 3 verified trainers, 40 participants (varied
LGA/skill/streak/XP), 5 pathways × 6 lessons each, 4 circles, 24 posts with
realistic milestone stories + reactions + comments (including trainer
comments), 15 private trainer notes, 220 referrals across the funnel with
drop-off reasons, 340 survey responses (baseline + midline) with the exact
`answers` fields Section 8 asks for, 2 broadcasts.

## 🟡 Partially built

- **UI screens:** only `/`, `/signup`, and the admin login *endpoint* have
  real pages. The other 32 participant/admin screens (Sections 6–7 of the
  spec) need to be built as React components against
  `docs/design-handoff/design-tokens.json` and the CSS tokens already wired
  into `src/app/globals.css` (`--c-plum`, `--c-magenta`, `--c-gold`, etc.) —
  every color/type/spacing/radius token from the spec is live and ready to
  use, just not yet composed into all 35 screens.
- **Panic-hide UI:** the PIN-verification API (`/api/me/verify-pin`) and the
  `panic_hide_enabled` (default true) field exist; the actual Calculator
  disguise screen, the 2-second long-press gesture, and the tab-title/favicon
  swap (spec Section 4, principle 8) are not yet built.
- **PWA:** `public/manifest.json` exists with the branded icon default (per
  spec Section 5's explicit instruction to default branded and flag the
  question — see Section 14 open item). No service worker yet for the
  offline-lesson-download / draft-post-queue behavior (spec Section 4,
  principle 3) — the `lesson_progress.downloaded_offline` column is ready for
  it.
- **MapLibre + real Nigerian LGA GeoJSON:** the admin overview API returns
  `{lga, count}` dot data; the spec's recommended MapLibre + HDX-boundaries
  map component itself isn't built yet (currently no map render at all).

## 🔴 Not started

- Baseline-vs-endline comparison UI (data model supports it via
  `survey_wave`, no endline data or comparison screen yet — spec explicitly
  says the UI can ship later).
- Real Facebook Graph API / LinkedIn Share API integration (blocked on app
  review per spec Section 14 — mocked interface is ready to swap in).
- Real SMS gateway selection (blocked on vendor choice per spec Section 14).
- Native-speaker review of the Hausa/Yorùbá starter glossary, and sourcing an
  Ìgbò glossary (spec explicitly requires this before shipping — do not
  machine-translate).
- Photography commission (every photo is a `[ photo: label ]` placeholder per
  spec's own instruction not to ship placeholder art to production, but real
  photos aren't sourced yet).

## Open items already flagged in the spec (Section 14) — still open

- Whether the PWA home-screen icon should be branded (current default, per
  the spec's own instruction) or always-neutral for safety — needs an
  explicit decision from the SheRISE team, not a default.
- Photography budget/commission.
- Yorùbá/Hausa/Ìgbò translation vendor + native-speaker review.
- Facebook/LinkedIn app review timeline.
- SMS provider selection.

## Running locally

```bash
npm install
npm run dev      # http://localhost:3000 — both surfaces reachable
```

Demo accounts (seeded automatically on first request, password
`password123` for all, participant PIN is `1234`):
- Admin: `admin@sherise.org`
- Sponsor: `sponsor@bluesapphire.ng`
- Trainers/participants: seeded with generated phone numbers — inspect via
  `/api/admin/participants` after logging in as admin.

## Building for production

```bash
npm run build     # runs `next build --webpack` — see note below
npm run start
```

**Note on Turbopack:** `next build` (Turbopack, the Next.js 16 default) hangs
indefinitely in this sandbox with this route count + the native
`better-sqlite3` dependency — root cause not fully isolated, may be specific
to this Next.js 16.3.5 canary. `next build --webpack` completes reliably in
~45s and produces a working production server (verified: all 37 API routes
compile, `next start` serves correctly). `package.json`'s `build` script is
set to `next build --webpack` for this reason. Worth re-testing plain
`next build` against a newer stable Next.js release before assuming this is
permanent.

## Deploying the two surfaces separately

Per the requirement that participant and admin deploy to separate domains
from one codebase:
1. Deploy this repo twice (two Vercel/Render projects, or two Cloudflare
   Pages projects).
2. On the `sherise.com` deployment, set `NEXT_PUBLIC_APP_SURFACE=participant`.
3. On the `sherise-admin.com` deployment, set `NEXT_PUBLIC_APP_SURFACE=admin`.
4. Both need the same database connection (once migrated off SQLite to a
   real hosted Postgres/Supabase instance — SQLite is file-based and won't
   work across two separate serverless deployments sharing state).
