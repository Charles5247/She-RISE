# Handoff: SheRISE — Bold & Empowering

**Feature:** Community & skill-training platform + admin M&E dashboard for women reintegrating from correctional and rehabilitation centers.
**Approved direction:** Concept 02 — Bold & Empowering (editorial, magenta + gold on plum, magazine-scale typography).
**Prepared:** September 2026 · handoff v1.0

---

## Overview

SheRISE has two experiences bundled in one product:

1. **Participant mobile app** — an avatar-first community feed, skill-training pathways, and a personal progress tracker. Progress posts can cross-post to Facebook / LinkedIn.
2. **Admin web dashboard** — trainers, sponsors and the SheRISE team monitor program reach, community perception, referrals, and participant progress.

The approved visual direction is **Bold & Empowering** — an editorial magazine treatment: **Bricolage Grotesque** display type, **Inter** body, a **deep plum + gold** palette accented with **magenta**. Progress posts feel like headlines; the admin dashboard reads like a confident data spread. See `design-principles.md` for the eight rules that apply across all screens.

## About the design files

The files in `prototype/` are **HTML/JSX design references** — a working prototype showing the intended look, layout, and behavior. **They are not production code to copy directly.** Recreate these designs inside the SheRISE codebase's existing environment (or, if none exists yet, pick the framework that best fits — React Native for mobile + Next.js / Remix / Vite-React for admin web is a reasonable default). Use the codebase's established component library, state management, and API patterns.

Open `SheRISE Bold - Design Reference.html` in any modern browser to explore all screens. It's a single self-contained file — no server required. Use the left rail to navigate; keyboard `←` `→` to flip screens.

## Fidelity

**High-fidelity.** Exact colors, typography, spacing, radii, and interaction states are specified below and reflected in the prototype. Photography is represented by striped placeholders with monospace labels (e.g. `[ photo: uniform · finished ]`) — commission real program photography or curate a stock library before ship; the placeholders indicate crop, aspect ratio, and treatment.

---

## Screens (35 total)

Grouped by surface. Keys correspond to route hashes in the prototype (e.g. `#/feed`).

### Onboarding & Auth (mobile · 390 × 780)

| # | Key | Screen | Purpose |
|---|---|---|---|
| 01 | `preloader` | Preloader / splash | First frame while app boots; brand impression |
| 02 | `welcome` | Welcome carousel | 3-slide value prop; skip button top-left |
| 03 | `signup` | Sign up | Phone or email + T&C consent |
| 04 | `otp` | Verify code | 6-digit OTP, 24-second resend timer |
| 05 | `create-profile` | Create profile | First name (public), last name (private), age, LGA |
| 06 | `pick-path` | Language & skill | Language picker (English / Yorùbá / Hausa / Ìgbò) then skill picker |
| 07 | `login` | Login | Phone/email + password; trainer login sub-CTA |
| 08 | `forgot` | Forgot password | Reset link; explicit "never mentions program history" note |

### Participant App (mobile · 390 × 780)

| # | Key | Screen |
|---|---|---|
| 09 | `feed` | Community feed — milestone hero card + secondary posts |
| 10 | `composer` | Feed composer — milestone tag + amplify (FB/LinkedIn) toggles |
| 11 | `post-detail` | Post detail — comments (trainer verified badge) |
| 12 | `notifications` | Notifications grouped by day |
| 13 | `circles` | Circles directory — browse & join |
| 14 | `training-home` | Pathway home — current-skill hero + module list |
| 15 | `lesson` | Lesson detail — video, XP bar, steps |
| 16 | `lesson-complete` | Celebrate screen — gold medal, XP earned, next lesson |
| 17 | `progress` | Progress tracker — ring, streak, medals grid |
| 18 | `milestone` | Milestone detail — story, amount, verifier |
| 19 | `profile` | My profile — hero, medals, linked social accounts |
| 20 | `edit-profile` | Edit profile — name, bio, LGA, privacy toggles |
| 21 | `settings` | Settings — account, language, safety, about |
| 22 | `trainer-chat` | 1:1 DM with verified trainer |
| 23 | `help-safety` | Emergency contact + panic-hide gesture |

### Admin Web (desktop · 1440 wide)

| # | Key | Screen |
|---|---|---|
| 24 | `admin-login` | Admin login (split-screen editorial) |
| 25 | `admin-overview` | Dashboard home — KPI hero + priorities panel + momentum + Nigeria map |
| 26 | `admin-participants` | Participants list — filters + tabular data |
| 27 | `admin-participant` | Participant detail — identity, outcomes, trainer notes, timeline |
| 28 | `admin-referrals` | Referral pipeline — Referred→Screened→Eligible→Enrolled funnel |
| 29 | `admin-content` | Content library — lessons grid with completion metrics |
| 30 | `admin-reports` | Reports & exports — funder-ready PDF / XLSX |
| 31 | `admin-broadcasts` | Compose + send SMS-fallback broadcasts to cohorts |
| 32 | `admin-trainers` | Trainers & sponsors directory |

### States

| # | Key | Screen |
|---|---|---|
| 33 | `empty-feed` | Empty feed (newcomer) |
| 34 | `no-wifi` | Offline mode (shows downloaded lessons) |
| 35 | `error` | Error / retry |

---

## Design tokens

Copy these into your token file (Tailwind config, CSS custom properties, or your existing token system).

### Colors

```
/* Brand */
--c-plum:        #2A0E2E   /* primary background · dark surfaces · admin canvas */
--c-plum-mid:    #4A1F52   /* hero gradients pair with plum */
--c-magenta:     #D4306E   /* primary interactive · CTAs · streaks */
--c-magenta-deep:#9E1E52   /* deep magenta · photo overlays */
--c-gold:        #E8B84A   /* accent · milestones · trainer verified · sponsor cards */
--c-gold-deep:   #B08820   /* pressed / deep gold */

/* Surfaces */
--c-off:         #F9F5EE   /* mobile screen background */
--c-cream:       #F5EFE6   /* light surface · card fills */
--c-cream-deep:  #E8DDCB   /* subtle warm border · chip bg */
--c-ink:         #1A0A1E   /* primary text on light */
--c-ink-soft:    #4A3A44   /* secondary text on light */
--c-line:        #DED3C0   /* border on light surfaces */
--c-line-soft:   rgba(232,184,74,0.10)  /* subtle divider on plum */

/* Dark-surface tokens (admin & hero cards) */
--c-dark-text:      #F5EFE6   /* primary text on plum */
--c-dark-text-soft: rgba(245,239,230,0.65) /* secondary text on plum */
--c-dark-border:    rgba(232,184,74,0.15)  /* border on plum */
--c-dark-card-bg:   rgba(245,239,230,0.04) /* card fill on plum */

/* Semantic */
--c-success: #5F7A5A
--c-warning: #E8B84A   /* = gold; reuse */
--c-danger:  #B4463B
```

### Typography

Two Google fonts (import both):

```
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
```

**Bricolage Grotesque** — display (headlines, buttons, section titles). Weights 500, 700, 800. Always `letter-spacing: -0.02em` to -0.035em on large sizes.
**Inter** — body copy, form input values, secondary UI text.
**IBM Plex Mono** — labels, timestamps, IDs, KPI captions. `letter-spacing: 0.06em`–`0.14em`, often uppercase.

Scale:

| Role | Font | Size | Weight | Line-h | Letter-spacing |
|---|---|---|---|---|---|
| Display XL (hero) | Bricolage Grotesque | 88–160px | 800 | 0.9 | -0.035em |
| Display L (page title) | Bricolage Grotesque | 44px | 800 | 0.95 | -0.03em |
| Display M (card title) | Bricolage Grotesque | 24–30px | 800 | 1.0 | -0.02em |
| Section title | Bricolage Grotesque | 20–22px | 700–800 | 1.1 | -0.02em |
| Body large | Inter | 16–18px | 400 | 1.55 | 0 |
| Body | Inter | 13–14px | 400–500 | 1.4–1.5 | 0 |
| Caption / hint | Inter | 11–12px | 500 | 1.45 | 0 |
| Label (mono) | IBM Plex Mono | 10–11px | 500 | 1 | 0.14em |
| Micro label | IBM Plex Mono | 9px | 500 | 1 | 0.16em |
| Button | Bricolage Grotesque | 12–14px | 700 | 1 | 0.06em, uppercase |

### Spacing scale

4 · 6 · 8 · 10 · 12 · 14 · 16 · 20 · 24 · 32 · 40 · 48 · 60 · 72 · 80

### Border radius

- **4** — inputs, filter chips, badges
- **6** — cards, form containers, table cells
- **8** — buttons, hero cards, dialog surfaces
- **10** — pathway hero card
- **12** — image thumbnails inside cards
- **999** — pills / avatars / streak counter

### Shadows

Bold rarely uses shadows — the palette itself carries weight. When needed:

- Card lift: `0 12px 30px -12px rgba(212,48,110,0.4)` (magenta glow) or `0 12px 30px -12px rgba(232,184,74,0.4)` (gold glow)
- Modal / dialog: `0 40px 80px -30px rgba(0,0,0,0.5)`
- Elevated CTA: `0 20px 40px -20px currentColor` (uses the button's own tone)

### Motion

- Tab / route change: `160ms cubic-bezier(0.22, 1, 0.36, 1)`
- Card hover lift: `translateY(-4px)` over `300ms`
- Progress bars: `stroke-dashoffset` or `width` over `600ms ease`
- Streak flame: subtle 2s pulse (opacity 0.85 ↔ 1) — optional flourish

### Iconography

Line icons in the prototype are inline SVG stroked at 1.6–1.8. Recommended library: **Lucide Icons** (open source, matches the stroke style). Custom-drawn icons in the prototype: heart (fillable), medal, flame, spark, share, FB, LinkedIn, chevron-l/r, check, plus, home, book, chart, user, bell, search, camera, bookmark, filter, more, pin, download, clock, comment, play.

---

## Component patterns

Reusable primitives that appear throughout. Names below match the shared components in `shared.jsx`.

### Phone frame

- 390 × 780 rounded rectangle, 40px radius
- Status bar 44px tall (signal / wifi / battery SVGs)
- Home indicator: centered 130×5 pill at bottom-8, `opacity: 0.35`
- Screen chrome uses the screen's own `bg` / `fg` (light off-white surfaces with dark text for participant)

### Avatar

- Circle with initials
- Gradient fill: bold palette rotates through magenta → plum, gold → magenta, gold → plum
- Initials: **Bricolage Grotesque 700**, size = `size * 0.42`
- Optional gold ring: `2px solid #E8B84A` at offset `-3px` (for verified / storied users)
- Optional badge: 36% of size, top-right, `2px solid #fff` border

### Photo placeholder

- Diagonal repeating stripes at 135° over `--ph-tone` background
- Monospace caption at bottom-left: `[ photo: <label> ]` (10px, `letter-spacing: 0.02em`)
- On dark surfaces (over plum), tone the label with `rgba(255,255,255,0.7)`

### Milestone tag (chip)

- Inline-flex with icon + label
- Background: gold #E8B84A on plum text (#2A0E2E)
- Padding `4px 10px`, radius 4
- Font: **Bricolage Grotesque 700**, 10px, `letter-spacing: 0.12em`, uppercase

### Streak flame counter

- Padding `4px 12px`, radius 999
- Background plum, gold flame icon + gold count number
- **Bricolage Grotesque 700**, 13px

### CTA button (primary)

- Padding `12–14px vertical, 16–20px horizontal`
- Radius 8
- Background: magenta `#D4306E`, text white
- **Bricolage Grotesque 700**, 12–14px, `letter-spacing: 0.06em`, `text-transform: uppercase`
- Hover: darken to `#9E1E52`

### Bottom tab bar (mobile)

- Fixed 78px tall (20px safe area at bottom)
- Background: plum with 95% opacity + `backdrop-filter: blur(20px)`
- Border-top: `1px solid rgba(232,184,74,0.15)`
- 5 tabs: Feed, Learn, **Plus (FAB)**, Progress, Me
- Active tab tint: gold `#E8B84A`; inactive: `rgba(245,239,230,0.5)`
- Center plus button: 48×48 magenta circle, elevated 6px, gold-glow shadow

### Progress ring (used on Progress screen)

- Two concentric SVG circles (bg + fg), rotated -90°
- Foreground stroke: gold, animated via `stroke-dashoffset`
- Center label: **Bricolage Grotesque 800**, `size × 0.28`
- Sublabel below: 10px uppercase, `letter-spacing: 0.06em`

### KPI card (admin)

- Background: `rgba(245,239,230,0.04)` on plum surface
- Border: `1px solid rgba(232,184,74,0.15)`
- Radius: 10
- Label (mono, gold): 10px uppercase `letter-spacing: 0.14em`
- Value: **Bricolage Grotesque 800**, 34px, `letter-spacing: -0.03em`
- Delta indicator: 11px gold, "+184 · 30d"

---

## Interactions & behavior

### Global

- **Keyboard**: `←` / `→` navigate screens in the reference prototype. Not required in production.
- **Route persistence**: URL hash + localStorage. Production should use proper client routing.
- **Language**: All copy in the prototype is English. Real implementation must load translations for Yorùbá / Hausa / Ìgbò (see language picker at `#/pick-path`). Copy strings are wrapped in the prototype but should be extracted to i18n keys.

### Cross-post to Facebook / LinkedIn

- Composer shows two toggle cards inline: `Amplify to FB` and `Amplify to LinkedIn`
- Default state: **both OFF**. User must consciously turn on before publish.
- Preview text renders below the toggles: *"First paying tailoring job. Three uniforms. #SheRISE"*
- **Guarantee (design principle 02):** system-generated cross-post copy **never mentions program history**. It only references the milestone the user explicitly tagged.
- On publish: post to feed instantly; cross-post to third parties queued with a 30-second undo toast.

### Milestone tag

- Composer requires the user to pick a milestone type: First income · Week complete · New skill · None.
- Selection changes the accent color of the composer (magenta for income, gold for lesson milestones).
- A milestone-tagged post is rendered as a "hero" card in the feed (full-bleed photo, gold "Milestone" pill, dark plum bottom-fade).

### Named reactions

- Instead of anonymous likes, the participant chooses "Cheer / Hold / Celebrate" (design principle 07).
- Rendered as stacked avatars + prose: *"Grace celebrated · Amina cheered · +22"*

### Verified trainer

- Trainers get a small `checkmark on sage` badge over their avatar (badge prop on `<Avatar>`).
- Their username row also shows a `Trainer · Verified` gold pill.
- Their posts have a subtly different background (paper tint) to distinguish authority from peer voices.

### Panic-hide gesture

- Long-press the home indicator (bottom of screen) for **2 seconds**.
- App disappears behind a **fake Calculator screen** (a real-looking calculator UI that survives inspection).
- Unlock requires the user's PIN.
- Toggle lives on `#/help-safety` — **on by default**.

### Offline-first

- Every lesson has a downloaded state (`no-wifi` screen shows how these appear).
- Composer drafts save locally; unsent posts queue with a "Will send when online" affordance.
- Admin dashboard is online-only (network required).

### Admin export audit

- Every downloaded participant record is logged with `{who, what, when, purpose}`.
- Admin login screen references this: *"All access is audited."*
- Custom export builder (`admin-reports`) requires the user to enter a "documented purpose" before generation.

---

## State management

Suggested state slices (framework-agnostic):

- `auth` — session, current user (id, role: `participant | trainer | admin | sponsor`, language)
- `feed` — posts (paginated), pending drafts, cross-post outbox
- `training` — pathways, module completion, current lesson, offline downloads (size cached)
- `progress` — milestones, streak, income log, medals earned
- `notifications` — inbox, read/unread state
- `circles` — subscribed circles + directory
- `chat` — trainer DM threads
- `admin` — participants list (with server-side filters), selected participant, funnel data, exports queue
- `ui` — active language, panic-hide toggle, download-quality preference

## Data requirements (backend contracts to negotiate)

- **Feed** — `GET /posts?circle=<id>&cursor=...` returning post + reactions + comment count
- **Post** — `POST /posts` (body + milestone + attachments + crosspost targets)
- **Cross-post** — `POST /crosspost/{fb|linkedin}` with server-generated copy (never sends program history)
- **Training** — `GET /pathways/{id}` + `GET /lessons/{id}` (streaming video URL + step reflections)
- **Progress** — `GET /me/progress` returning milestones, streak, income entries
- **Admin** — dedicated `/admin/*` namespace, requires trainer/staff scope
- **Referrals** — `GET /admin/referrals?range=90d` returning funnel counts + drop-off reasons

## Responsive behavior

- **Participant app** — mobile-first, 390 baseline. Also renders inside a WebView / hybrid shell if needed. Not designed for tablet or desktop; a phone-frame simulation is fine for tablet users.
- **Admin web** — 1440 baseline. Down to 1180 the two-column grid collapses to stacked. Below 1180, show a "Best viewed on desktop" gentle guardrail — this tool is not a phone experience.

## Accessibility

- All text ≥ 14px in participant app; ≥ 12px in admin dashboard (mono labels excepted, at 10–11px — always paired with a value).
- Contrast: verify magenta on white for CTAs (AAA at 14px+); gold on plum for accent labels (AA).
- Every icon has a paired text label except in the bottom tab bar (labels below icons).
- Hit targets ≥ 44px in participant flows.
- Focus rings: 2px gold, offset 2px, radius matches element radius.

---

## Files

Inside `prototype/`:

| File | Purpose |
|---|---|
| `index.html` | Entry — loads Bricolage Grotesque + Inter + IBM Plex Mono, mounts the React app |
| `app.jsx` | Router — screen inventory, keyboard nav, hash persistence |
| `shell.css` | Global chrome — top switcher, left rail, main canvas, phone frame |
| `shared.jsx` | Cross-concept primitives — Avatar, Photo placeholder, Phone, Icon set, NigeriaMap, TabBar, Spark, Ring, FormField, PButton, EmptyState, AdminShell |
| `tweaks_panel.jsx` | Runtime tweaks UI — swap accent colors; not needed in prod |
| `concept-2.jsx` | **Bold palette + Feed / Training / Progress / Admin overview** (the four hero screens) |
| `concept-2-auth.jsx` | 8 onboarding & auth screens |
| `concept-2-app.jsx` | 11 remaining participant app screens |
| `concept-2-admin.jsx` | 8 remaining admin screens + 3 states |

`SheRISE Bold - Design Reference.html` is a **single-file bundled version** — same prototype, everything inlined. Send this to reviewers who don't need the source.

## Assets to commission

Everything visual in `[ photo: … ]` placeholders. Aspect ratios and labels are the brief:

- Portraits of Nigerian women, 20s–50s, dignified & real (not stock-glossy)
- Environmental shots: tailoring workshops, catering setups, community-training gatherings, small-business planning
- Milestone shots: finished uniforms, prepared meals, styled hair, first receipts

Nigeria map on admin: the prototype ships a stylized approximation (`NigeriaMap` in `shared.jsx`). Replace with a proper GeoJSON of Nigerian LGAs — recommend the [Humanitarian Data Exchange Nigeria LGA boundaries](https://data.humdata.org/dataset/nigeria-admin-level-2-boundaries) plotted via D3 or MapLibre.

---

## What to build first (recommended sequence)

1. **Design tokens** — encode colors, type scale, spacing, radii, motion into your token layer.
2. **Auth flow (mobile)** — screens 01–08. Wire OTP + language i18n scaffolding here.
3. **Feed + Composer + Post Detail** — the emotional core of the participant experience.
4. **Cross-post integrations** — Facebook Graph + LinkedIn OAuth. Server-generated copy contract.
5. **Training + Progress + Milestone** — the retention loop.
6. **Admin overview + Participants list** — the funder-facing surface.
7. **Referrals funnel + Reports/exports** — the accountability layer.
8. **Panic hide + Help & safety** — safety is not a v2; ship it in v1.
9. **Content library + Broadcasts + Trainers** — internal ops screens; can lag by 2 weeks.

Total scope estimate: **12 weeks to pilot** (see the roadmap page in the prototype at `#/pres/roadmap` in the full 3-concept file, or the roadmap section in the original review deck).

---

## Questions / open items

- **Photography commission budget** — decide before Phase 02 kicks off.
- **Yorùbá / Hausa / Ìgbò translations** — vendor selection + turnaround timeline.
- **Facebook / LinkedIn app-review** — start early, both platforms have multi-week reviews.
- **Pilot LGA selection** — confirmed as Ondo Central per the roadmap.
- **SMS provider** — for broadcasts fallback and OTP.

For clarifications on any screen, reference the prototype's URL hash (e.g. *"see `#/admin-referrals`"*) — that resolves to a specific artboard.
