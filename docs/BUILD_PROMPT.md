# SheRISE — Build Prompt for Genspark

**How to use this file:** Copy everything below the divider into Genspark as your build prompt. If Genspark accepts file attachments, also attach `design-tokens.json`, `SheRISE Bold - Design Reference.html`, and `screen-inventory.md` from the design handoff — they give the builder a literal visual reference to match pixel-for-pixel. This prompt is self-contained (all tokens, screens, and rules are written out below) so it will still work as text-only if attachments aren't supported.

---

## Build this: SheRISE

Build SheRISE, a two-sided product for a nonprofit skill-training and reintegration program for women returning from correctional and rehabilitation centres in Nigeria:

1. **Participant mobile app** — an avatar-first community feed, skill-training pathways with gamified progress, and a personal milestone tracker. Progress posts can optionally cross-post to Facebook and LinkedIn.
2. **Admin web dashboard** — used by SheRISE staff, verified trainers, and sponsors to monitor program reach, community perception research, referrals, participant progress, and to generate funder-ready reports.

Follow every spec below exactly. Where a value is given (a hex code, a font size, a field name), treat it as a locked decision, not a suggestion — do not substitute your own defaults.

---

## 1. Users & roles

- **Participant** — a woman enrolled in the program. Primary user of the mobile app. Public profile uses first name only; last name, admission history, and case details are never shown to her peers or on any public-facing surface.
- **Trainer** — delivers skill training, verified with a badge, can DM participants 1:1, leaves private progress notes, uses the mobile app plus a scoped admin login.
- **Sponsor** — funds participants or cohorts, views read-only progress/outcomes in the admin dashboard.
- **Admin / SheRISE staff** — full access to the admin dashboard: participants, referrals, M&E research data, content library, broadcasts, reports, exports.

## 2. Core loop

A participant completes a skill lesson → earns XP and a streak → optionally tags a milestone (first income, week complete, new skill) → shares it to the community feed → chooses whether to amplify it to Facebook/LinkedIn → her trainer and circle respond with named reactions and comments. Admins and sponsors watch this loop aggregate into program-level reach, retention, and first-income metrics on the dashboard.

## 3. Recommended tech stack

- **Participant app:** Next.js (App Router) — **the same web app as the admin, one codebase.** This is a correction from an earlier draft that assumed React Native: the signed consulting agreement's deliverables list specifies **"a fully functional SheRISE web application (user-facing platform)"** — not a native mobile app. That matters practically, not just contractually: a native app would mean an Android APK (sideloaded, since there's no indication the client has a Google Play developer account) or iOS TestFlight/App Store distribution, both of which add real friction for the target users — installing an unsigned APK requires enabling "unknown sources" on the phone, which is a meaningful barrier and a trust/safety concern for women who may not own their device outright. A responsive, mobile-first Next.js web app avoids all of that: participants open a URL, nothing to install, nothing to sideload. Build it installable as a **Progressive Web App** (web app manifest + service worker) so it still gets an icon on the home screen and a full-screen app-like feel for the participant flows (screens 1–26 below), without ever requiring an app-store or APK distribution path. If the client later decides they do want a store-distributed app, this same React/TypeScript codebase is the easiest possible starting point for wrapping in Capacitor or React Native — but do not build that now; it isn't what was contracted or paid for.
- **Admin web:** same Next.js app, gated behind the `/admin` route group and role-based middleware — no separate codebase or deploy needed, though a separate Vercel project is fine if the team prefers isolating the two surfaces operationally.
- **Backend/database:** Supabase (PostgreSQL) — the M&E research data (Section 10 below) is relational and filter-heavy (by LGA, cohort, date range, demographic), which favors SQL joins over a NoSQL store. Use Supabase Auth (role claims: `participant | trainer | admin | sponsor`), Supabase Storage for photos/video, and Row Level Security policies enforcing the access rules in Section 9.
- **Maps:** MapLibre GL + a GeoJSON of Nigerian LGA boundaries (Humanitarian Data Exchange Nigeria admin-level-2 boundaries) for the admin geographic-coverage map — do not ship a hand-drawn approximation to production.
- **Cross-posting:** Facebook Graph API + LinkedIn OAuth/Share API — both require app review before this can go live; build the feature behind a config flag so it can ship without the reviews being complete.
- **SMS fallback (broadcasts + OTP):** any Nigeria-capable SMS gateway (e.g., Termii, Africa's Talking) — pick one and wire it behind an interface so it's swappable.
- **i18n:** all UI strings in the participant app must be externalized to translation keys from day one (English is the only populated locale at first; Yorùbá, Hausa, Ìgbò keys exist but can fall back to English until translations arrive).

## 4. Non-negotiable product principles

These override any default assumption you'd otherwise make. Apply them to every screen; if a generated screen or copy string violates one of these, it is a bug, not a stylistic choice.

1. **Dignity before data.** A participant is a person, not a case number. Public-facing copy never references her past, uses her name, and celebrates her wins. Cohort codes, row IDs, and category tags are admin-only, shown in tooltips/tables, never on public surfaces.
2. **Consent is a first-class feature.** Cross-posting to Facebook/LinkedIn defaults to **off**. System-generated cross-post copy must never contain the words "correctional," "reintegration," "rehabilitation," or "program" — it may only reference the specific milestone the user tagged, in her own words plus her chosen milestone label.
3. **Offline-first, low-data.** Lessons download for offline viewing via a service worker cache. Posts draft locally (IndexedDB) and queue for send when connectivity returns. Design for 2G. Video defaults to 480p; HD is opt-in and wifi-gated.
4. **Legible on small screens.** Body text ≥14px, hero copy ≥22px, hit targets ≥44px, contrast never below WCAG AA, icons always paired with a text label except in the bottom tab bar.
5. **Trainers are visible.** A verified-trainer checkmark badge appears on the avatar; a "Trainer · Verified" gold pill appears inline. Trainer notes on a participant's progress are private to that participant — never shown to circles, never cross-posted.
6. **Funder-legible dashboards.** The admin surface answers what a funder needs to justify continued funding: reach, retention, first income, community perception — export-ready. Numbers are large and unambiguous; drop-off funnels show absolute counts alongside percentages. Every export/download is logged.
7. **Named reactions, not likes.** Reactions are "Cheer / Hold / Celebrate," never an anonymous like count. Render reaction summaries as prose ("Grace celebrated · Amina cheered · +22"), never a bare number.
8. **Panic-hide, always available, on by default.** A 2-second long-press on the home indicator disguises the app as a working Calculator UI — realistic calculator history, zero SheRISE branding anywhere. As a web app, implement this as an in-app route swap (not an OS-level trick): the calculator view replaces the whole viewport, the browser tab title and favicon swap to something neutral for the duration, and the URL changes to a neutral path so a glance at the address bar doesn't give it away either. Unlock requires the user's PIN. This ships in v1, not a later phase. (See Section 5 for an open question on whether the installed home-screen icon itself should also default to neutral branding — flag that to the SheRISE team rather than deciding it silently.)

## 5. Design system (locked — Bold & Empowering)

Editorial-magazine direction: magazine-scale display type, deep plum + gold palette accented with magenta. Progress posts read like headlines; the admin dashboard reads like a confident data spread.

### Colors (exact hex — do not substitute)

```
Brand
--c-plum:         #2A0E2E   primary background, dark surfaces, admin canvas
--c-plum-mid:     #4A1F52   hero gradients, paired with plum
--c-magenta:      #D4306E   primary interactive, CTAs, streaks
--c-magenta-deep: #9E1E52   deep magenta, photo overlays, button hover/pressed
--c-gold:         #E8B84A   accent, milestones, "trainer verified," sponsor cards
--c-gold-deep:    #B08820   pressed/deep gold

Surfaces
--c-off:          #F9F5EE   mobile screen background
--c-cream:        #F5EFE6   light surface, card fills
--c-cream-deep:   #E8DDCB   subtle warm border, chip background
--c-ink:          #1A0A1E   primary text on light
--c-ink-soft:     #4A3A44   secondary text on light
--c-line:         #DED3C0   border on light surfaces
--c-line-soft:    rgba(232,184,74,0.10)   subtle divider on plum

Dark-surface tokens (admin & hero cards)
--c-dark-text:      #F5EFE6
--c-dark-text-soft: rgba(245,239,230,0.65)
--c-dark-border:    rgba(232,184,74,0.15)
--c-dark-card-bg:   rgba(245,239,230,0.04)

Semantic
--c-success: #5F7A5A
--c-warning: #E8B84A  (reuse gold)
--c-danger:  #B4463B
```

### Typography

Import: Bricolage Grotesque (weights 400/500/600/700/800, optical size axis), Inter (400/500/600/700/800), IBM Plex Mono (400/500).

- **Bricolage Grotesque** — all display: headlines, buttons, section titles. Large sizes always use `letter-spacing: -0.02em` to `-0.035em`.
- **Inter** — body copy, form values, secondary UI text.
- **IBM Plex Mono** — labels, timestamps, IDs, KPI captions. `letter-spacing: 0.06em`–`0.14em`, usually uppercase.

| Role | Font | Size | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| Display XL (hero) | Bricolage Grotesque | 88–160px | 800 | 0.9 | -0.035em |
| Display L (page title) | Bricolage Grotesque | 44px | 800 | 0.95 | -0.03em |
| Display M (card title) | Bricolage Grotesque | 24–30px | 800 | 1.0 | -0.02em |
| Section title | Bricolage Grotesque | 20–22px | 700–800 | 1.1 | -0.02em |
| Body large | Inter | 16–18px | 400 | 1.55 | 0 |
| Body | Inter | 13–14px | 400–500 | 1.4–1.5 | 0 |
| Caption/hint | Inter | 11–12px | 500 | 1.45 | 0 |
| Label (mono) | IBM Plex Mono | 10–11px | 500 | 1 | 0.14em |
| Micro label | IBM Plex Mono | 9px | 500 | 1 | 0.16em |
| Button | Bricolage Grotesque | 12–14px | 700 | 1 | 0.06em, uppercase |

### Spacing scale
`4 · 6 · 8 · 10 · 12 · 14 · 16 · 20 · 24 · 32 · 40 · 48 · 60 · 72 · 80`

### Border radius
- `4` inputs, filter chips, badges
- `6` cards, form containers, table cells
- `8` buttons, hero cards, dialog surfaces
- `10` pathway hero card
- `12` image thumbnails inside cards
- `999` pills / avatars / streak counter

### Shadows
Used sparingly — the palette carries the weight.
- Card lift: `0 12px 30px -12px rgba(212,48,110,0.4)` (magenta) or `0 12px 30px -12px rgba(232,184,74,0.4)` (gold)
- Modal/dialog: `0 40px 80px -30px rgba(0,0,0,0.5)`
- Elevated CTA: `0 20px 40px -20px currentColor`

### Motion
- Tab/route change: `160ms cubic-bezier(0.22, 1, 0.36, 1)`
- Card hover lift: `translateY(-4px)` over `300ms`
- Progress bars: animate `stroke-dashoffset` / `width` over `600ms ease`
- Streak flame: optional 2s pulse, opacity 0.85 ↔ 1

### Iconography
Line icons, stroke width 1.6–1.8. Use **Lucide Icons**. Custom icon set needed beyond Lucide defaults: fillable heart, medal, flame, spark, share, Facebook, LinkedIn.

### Component patterns

- **Phone frame (mobile reference only, not shipped UI):** 390×780, 40px radius, 44px status bar, home indicator centered 130×5 pill at bottom-8, opacity 0.35. This is a design-reference device frame for reviewing mockups — the actual build is a responsive web app, not a native app running inside real device chrome.
- **PWA manifest / home-screen icon:** the design handoff doesn't specify whether the installed icon itself should carry SheRISE branding or stay neutral at all times (as opposed to only during an active panic-hide). Default to branded (matches the design tokens) unless the SheRISE team says otherwise — but flag this back to them explicitly, since for this user base an always-neutral icon may be safer than a branded one that panic-hide only disguises after the fact.
- **Avatar:** circle with initials in Bricolage Grotesque 700 at `size * 0.42`; gradient fill rotating magenta→plum / gold→magenta / gold→plum; optional 2px solid gold ring at -3px offset for verified/storied users; optional badge at 36% of size, top-right, 2px white border.
- **Photo placeholder (until real photography is commissioned):** diagonal 135° stripes over a tone background, monospace caption bottom-left `[ photo: <label> ]` at 10px; on plum backgrounds, tone the label `rgba(255,255,255,0.7)`.
- **Milestone tag chip:** icon + label, gold background `#E8B84A` with plum text `#2A0E2E`, padding `4px 10px`, radius 4, Bricolage Grotesque 700 at 10px, `letter-spacing: 0.12em`, uppercase.
- **Streak flame counter:** padding `4px 12px`, radius 999, plum background, gold flame icon + gold count, Bricolage Grotesque 700 at 13px.
- **Primary CTA button:** padding `12–14px vertical, 16–20px horizontal`, radius 8, background magenta `#D4306E`, white text, Bricolage Grotesque 700 at 12–14px, `letter-spacing: 0.06em`, uppercase, hover/pressed darkens to `#9E1E52`.
- **Bottom tab bar (mobile):** fixed 78px tall (+20px safe area), plum at 95% opacity with `backdrop-filter: blur(20px)`, 1px top border `rgba(232,184,74,0.15)`. 5 tabs: Feed, Learn, **Plus (center FAB)**, Progress, Me. Active tint gold `#E8B84A`, inactive `rgba(245,239,230,0.5)`. Center FAB: 48×48 magenta circle, elevated 6px, gold-glow shadow.
- **Progress ring:** two concentric SVG circles (bg + fg) rotated -90°, gold animated foreground stroke via `stroke-dashoffset`, center label Bricolage Grotesque 800 at `size * 0.28`, sublabel below at 10px uppercase, `letter-spacing: 0.06em`.
- **Admin KPI card:** background `rgba(245,239,230,0.04)` on plum, 1px border `rgba(232,184,74,0.15)`, radius 10, mono gold label at 10px uppercase `letter-spacing: 0.14em`, value in Bricolage Grotesque 800 at 34px `letter-spacing: -0.03em`, delta indicator in 11px gold (e.g. "+184 · 30d").

---

## 6. Participant app — screens (responsive web, mobile-first at 390 baseline)

Build every screen below. For each, the loading, empty, and error states must be designed and implemented — not deferred.

### Onboarding & auth
1. **Preloader** — brand splash while app boots; gold "SR" logo, magenta ambient blob, progress bar.
2. **Welcome carousel** — 3-slide value proposition, skip button top-left, dot pagination.
3. **Sign up** — phone or email + T&C consent checkbox.
4. **Verify code** — 6-digit OTP input, 24-second resend timer.
5. **Create profile** — first name (public), last name (private, never shown to peers), age, LGA, avatar photo.
6. **Language & skill picker** — language first (English / Yorùbá / Hausa / Ìgbò), then a 6-tile skill picker.
7. **Login** — phone/email + password, with a "Trainer login" sub-CTA that routes into the same login with a role hint.
8. **Forgot password** — reset link flow; must include an explicit reassurance line that resetting never mentions program history (principle 2).

### Community & training
9. **Feed** — story bar (avatars with gold ring for verified/storied users), a full-bleed "hero" milestone card (plum background, gold "Milestone" pill, gradient bottom-fade) for the top milestone-tagged post, compact secondary posts below, bottom tab bar.
10. **Composer** — milestone tag chip row (First income · Week complete · New skill · None; selecting one recolors the composer: magenta for income, gold for lesson milestones), photo attach, two amplify toggle cards (Facebook, LinkedIn — both default **off**), and a live preview strip of the generated cross-post copy. Publish posts to the feed instantly; queued cross-posts get a 30-second undo toast before actually sending to Facebook/LinkedIn.
11. **Post detail** — hero photo, action bar with the three named reactions (not a like button), comment list where trainer comments carry the verified badge.
12. **Notifications** — grouped by day ("Today," "Earlier this week"), avatar with a kind-badge per notification.
13. **Circles directory** — filter chips, tabular browse list with join/joined pill state.
14. **Pathway home** — plum hero card for the current skill pathway, module list with done/current/locked states.
15. **Lesson detail** — video player (defaults 480p, HD opt-in on wifi), streak counter pill, magenta→gold gradient XP progress bar, step list.
16. **Lesson complete** — celebration screen: gold radial medal, XP/streak/accuracy tri-card, next-lesson CTA.
17. **Progress tracker** — gold-on-plum progress ring, streak/earned/medals triad, 4-column medals grid (earned medals filled-in, locked ones outlined).
18. **Milestone detail** — plum hero card with amount + verifier, 3-cell stats grid, story quote from the participant.
19. **My profile** — plum hero card with gold-ring avatar, medals/streak/earned triad, linked-social rows showing Facebook/LinkedIn connection + on/off amplify state.
20. **Edit profile** — avatar with camera overlay, editable name/bio/LGA, privacy toggles.
21. **Settings** — grouped rows: account, wifi-only downloads, panic-hide toggle (on by default), language, log out.
22. **Trainer chat** — 1:1 DM thread with a verified trainer; message bubbles (magenta = me, white = them), typing composer.
23. **Help & safety** — magenta emergency-contact card with a call button, gold-outlined panic-hide row explaining the gesture.

### States
24. **Empty feed** — shown to a newcomer before she's joined any circle or posted.
25. **Offline mode** — shows only downloaded lessons; composer drafts persist locally with a "will send when online" affordance.
26. **Error/retry** — generic network-failure state; never lose an unsent post.

---

## 7. Admin web — screens (desktop, 1440 baseline)

Every admin screen shares an `AdminShell`: top nav (**Overview · Participants · Referrals · Perception · Content · Reports · Broadcasts · Trainers**), a 30d/90d/YTD/All date-range picker, an Export PDF action, and the signed-in admin's avatar. Below 1180px, collapse the two-column grid to stacked; below that, show a "best viewed on desktop" guardrail — this surface is not a phone experience.

1. **Admin login** — split screen: plum left half with a "Every rise, on record" hero and a line stating "All access is audited"; form on cream right half.
2. **Dashboard home (Overview)** — 5 KPI cards (Total Respondents / Communities / LGAs / Women / Men), a ranked Top Challenges list with magenta→gold bars, a Momentum/streak card, and the Nigeria LGA map (dark plum canvas, gold dots per community/LGA reached).
3. **Participants list** — filter tabs, 8-column table (name, LGA, cohort, skill, progress bar, medals, streak, status).
4. **Participant detail** — left column: identity card + trainer notes (private, staff-only). Right column: 4 outcome KPIs, an income sparkline, a colored-dot activity timeline.
5. **Referral pipeline** — 4-step funnel (Referred → Screened → Eligible → Enrolled) with red drop-off deltas between each step, 3 drop-off-reason cards, a top-LGA conversion ranked list, and a magenta-bordered "Signal" insight card.
6. **Perception (M&E research dashboard)** — see the full spec in Section 8; this is the tab that surfaces the community-survey findings.
7. **Content library** — filter chips, 3-column lesson-card grid (thumbnail, pathway/module tag, title, duration/views/completion-rate).
8. **Reports & exports** — a standard-reports list (5 rows) each with a Download button, plus a custom export builder with field checkboxes that **requires the admin to type a documented purpose before generating anything** (principle 6 + the audit requirement in Section 9).
9. **Broadcasts** — left: audience/title/body composer for SMS-fallback broadcasts; right: a "sent recently" panel with reach and open-rate.
10. **Trainers & sponsors** — left: trainer table with ratings; right: sponsor cards (women sponsored, sponsor since year).

---

## 8. Perception tab — full M&E research dashboard spec

This is the community-perception and needs-assessment research the program runs (survey data collected via Kobo or an equivalent tool, imported or synced into the platform). Build it as its own tab, not folded silently into Overview — funders and program staff read this section specifically to decide what the program should prioritize.

**Geographic coverage** — map of communities/LGAs reached; interview count per LGA; GPS/location data from the source survey tool; coverage progress against target.

**Community perception & stigma** — charts for: level of community acceptance; % reporting stigma/discrimination; types of discrimination identified; main reasons for stigma; community attitudes toward women returning from correctional/rehabilitation centres. *(Reminder: this data is admin-only. None of this framing ever surfaces on the participant app — see principle 1 and 2.)*

**Challenges faced by returning women** — ranked list of community-identified challenges: stigma/discrimination, unemployment, poverty, lack of skills, family rejection, lack of business opportunities, lack of community support, psychosocial challenges.

**Economic & livelihood needs** — main barriers to economic independence; skills the community believes women need; interest in entrepreneurship; perceived usefulness of cooperative groups; recommended livelihood opportunities.

**Digital & creative skills demand** — ranked demand for: content creation, digital marketing, graphic design, social media management, online business, video editing, tailoring/fashion, baking, bead making, soap making, other. This ranking should directly inform what shows up in the Content Library and Pathway options — treat it as a live input, not a static report.

**Psychosocial & social reintegration** — emotional/social challenges identified; perceived need for counselling; community perception of isolation/low confidence/anxiety; availability of existing support systems.

**Existing support & service gaps** — organizations currently supporting these women; types of support available; gaps in support; referral/support organizations identified by respondents.

**Community readiness** — % willing to support SheRISE; % willing to refer participants; organizations willing to partner; types of support communities can provide; free-text community recommendations.

**Data quality & enumerator monitoring** — interviews completed per enumerator; interviews by date; missing responses; duplicate submissions; average interview duration; GPS verification status; daily/weekly collection progress. This is an internal fieldwork-QA view — restrict it to admin role, not sponsor role.

**Baseline-to-endline comparison** — once endline data exists, compare baseline vs. endline on: community acceptance, stigma levels, economic opportunities, digital skills demand, access to support, cooperative participation, community readiness. Build the data model to support this comparison from day one (a `survey_wave` field of `baseline | midline | endline` on every response record) even though the endline UI can ship later.

**Suggested layout (reuse the KPI-card and chart patterns from Section 5):**
```
TOP:    Total Respondents | Communities | LGAs | Women | Men
MIDDLE: Geographic Coverage | Top Challenges | Stigma & Acceptance
LOWER:  Livelihood Needs | Digital Skills Needs | Creative Skills Needs
BOTTOM: Community Support & Partnerships | Psychosocial Needs | Key Recommendations
```

---

## 9. Data model sketch (Supabase / PostgreSQL)

Design the schema around these entities and relationships. Field lists are a starting spec, not exhaustive — fill in types, constraints, and indexes as you build, but do not rename these entities or their core fields, since the UI above references them by these names.

- **`users`** — `id`, `role` (`participant | trainer | admin | sponsor`), `first_name` (public), `last_name` (private — RLS: never selectable from a participant/public-facing query), `phone`, `email`, `language`, `lga`, `avatar_url`, `is_verified_trainer`, `panic_hide_enabled` (default `true`), timestamps.
- **`posts`** — `id`, `author_id`, `body`, `photo_url`, `milestone_type` (`first_income | week_complete | new_skill | none`), `crosspost_fb` (bool, default `false`), `crosspost_linkedin` (bool, default `false`), `crosspost_copy` (server-generated, must pass the "never mentions program history" filter before save), `circle_id` (nullable), `created_at`.
- **`reactions`** — `id`, `post_id`, `user_id`, `kind` (`cheer | hold | celebrate`), unique on `(post_id, user_id)`.
- **`comments`** — `id`, `post_id`, `author_id`, `body`, `created_at`.
- **`circles`** — `id`, `name`, `description`.
- **`circle_members`** — `circle_id`, `user_id`, `joined_at`.
- **`pathways`** — `id`, `title`, `skill_category`.
- **`lessons`** — `id`, `pathway_id`, `title`, `video_url_480p`, `video_url_hd`, `xp_value`, `order_index`.
- **`lesson_progress`** — `user_id`, `lesson_id`, `status` (`locked | current | done`), `completed_at`, `downloaded_offline` (bool).
- **`milestones`** — `id`, `user_id`, `post_id` (nullable), `type`, `amount` (nullable, for income milestones), `verifier_id` (trainer who verified), `story`.
- **`trainer_notes`** — `id`, `trainer_id`, `participant_id`, `body`, `created_at` — RLS: readable only by that trainer, that participant, and admins; never joinable into any public/feed query.
- **`referrals`** — `id`, `participant_id` (nullable until enrolled), `source`, `lga`, `stage` (`referred | screened | eligible | enrolled`), `drop_off_reason` (nullable), timestamps.
- **`survey_responses`** — `id`, `survey_wave` (`baseline | midline | endline`), `lga`, `community`, `respondent_gender`, `enumerator_id`, `gps_lat`, `gps_lng`, `duration_seconds`, `is_duplicate` (bool), `answers` (JSONB — the actual questionnaire payload, since survey instruments will evolve), `collected_at`.
- **`export_audit_log`** — `id`, `admin_id`, `what` (report/dataset name), `purpose` (required free text, entered at export time), `exported_at`.
- **`broadcasts`** — `id`, `sender_id`, `audience_filter`, `title`, `body`, `sent_at`, `reach_count`, `open_count`.

### Access rules (implement as RLS policies)
- A participant can read her own `trainer_notes`, but not another participant's.
- `last_name`, `survey_responses`, and `export_audit_log` are never exposed to the participant app's API surface at all — not just hidden in the UI.
- Sponsors get read-only access to aggregate/participant-progress views, not to `trainer_notes`, raw `survey_responses`, or the data-quality/enumerator-monitoring view.
- Every row read from `/admin/reports` or a custom export must write one `export_audit_log` row first; the write is transactional with the read — if the audit write fails, the export must fail too.

---

## 10. API surface (contracts to implement)

- `GET /posts?circle=<id>&cursor=...` → paginated posts with reactions summary + comment count.
- `POST /posts` → body, milestone, attachment, crosspost target flags.
- `POST /crosspost/{fb|linkedin}` → takes a `post_id`; generates copy server-side (never client-side, so the "no program history" filter can't be bypassed).
- `GET /pathways/{id}`, `GET /lessons/{id}` → includes the streaming video URL and step reflections.
- `GET /me/progress` → milestones, streak, income log.
- `GET /admin/referrals?range=90d` → funnel counts + drop-off reasons.
- `GET /admin/perception?wave=baseline&lga=<id>` → the Section 8 dataset, filterable by survey wave and LGA.
- `POST /admin/exports` → requires `purpose` in the body; writes `export_audit_log` before returning the file.
- All `/admin/*` routes require `admin` or `trainer` scope (trainer scope is read-only except for `trainer_notes` on their own participants); all routes return `401` with `{ code: 'UNAUTHORIZED', message: ... }` on missing/invalid session, and `403` with `{ code: 'FORBIDDEN', message: ... }` on a role mismatch.

---

## 11. Accessibility (every screen, not optional)

- Body text ≥14px in the participant app, ≥12px in admin (mono labels may go to 10–11px only when always paired with a labeled value).
- Contrast: verify magenta-on-white for CTAs meets AAA at 14px+; gold-on-plum for accent labels meets AA.
- Every icon has a paired text label, except the bottom tab bar (label sits under the icon).
- Hit targets ≥44px in all participant flows.
- Focus rings: 2px gold, 2px offset, radius matching the element.
- Every interactive icon-only control needs an `aria-label`. Modals/drawers trap focus, return focus to the trigger on close, and close on `Escape`.

---

## 12. What to build first (MVP sequence)

1. Design tokens (Section 5) — colors, type scale, spacing, radii, motion — encoded into the token layer of both codebases.
2. Auth flow (mobile), screens 1–8 — wire OTP and the i18n scaffolding here, even before translations exist.
3. Feed + Composer + Post detail — the emotional core.
4. Cross-post integrations (behind a config flag until Facebook/LinkedIn app review clears).
5. Training + Progress + Milestone screens — the retention loop.
6. Admin Overview + Participants list — the funder-facing surface.
7. Referrals funnel + Perception tab + Reports/exports — the accountability layer.
8. Panic-hide + Help & Safety — ship in v1, not deferred.
9. Content library + Broadcasts + Trainers — internal ops, can lag.

## 13. Localization — starter English → Hausa → Yorùbá glossary

Load these as the initial `ha.json` and `yo.json` translation files (alongside `en.json`) in the i18n layer, keyed however your i18n library expects (e.g. `feed.tab_label`, `auth.sign_up_cta`). This gives Genspark real strings to ship with on day one instead of English-only placeholders.

**Important:** these are a solid starting point, not final copy. Because this app serves a population where trust and dignity are the whole point (principle 1), have a native Hausa speaker and a native Yorùbá speaker from the program's own communities review every string — especially the onboarding, safety, and milestone copy — before it ships. Tone and register matter more here than in a typical app.

| English | Hausa | Yorùbá |
|---|---|---|
| Feed | Labarai | Ìròyìn |
| Learn (tab) | Koyo | Kẹ́kọ̀ọ́ |
| Progress (tab) | Ci gaba | Ìtẹ̀síwájú |
| Me (tab / profile) | Ni | Èmi |
| Cheer (reaction) | Taya murna | Yọ̀ pẹ̀lú |
| Hold (reaction) | Tallafawa | Tì lẹ́yìn |
| Celebrate (reaction) | Yi bikin | Ṣayẹyẹ |
| Milestone | Tarihi | Àṣeyọrí |
| First income | Kudin shiga na farko | Owó Wíwọlé Àkọ́kọ́ |
| Week complete | Kammala mako | Ìparí Ọ̀sẹ̀ |
| New skill | Sabon fasaha | Ọgbọ́n Tuntun |
| None | Babu | Kò sí |
| Streak | Kwanakin jere | Ọjọ́ Amúra |
| XP earned | Maki da aka samu | Àmì tí a jèrè |
| Welcome | Barka da zuwa | Ẹ káàbọ̀ |
| Skip | Tsallake | Fò |
| Continue | Ci gaba | Tẹ̀síwájú |
| Sign up | Yi rajista | Forúkọsílẹ̀ |
| Log in | Shiga | Wọlé |
| Log out | Fita | Jáde |
| Verify code | Tabbatar da lambar | Ìjẹ́rìí kóòdù |
| Resend code | Sake tura lambar | Tún kóòdù ránṣẹ́ |
| Forgot password | Manta kalmar sirri | Gbàgbé ọ̀rọ̀ìpamọ́ |
| Reset password | Sabunta kalmar sirri | Ṣàtúnṣe ọ̀rọ̀ìpamọ́ |
| Save | Ajiye | Fi pamọ́ |
| Publish / Post | Wallafa | Tẹ̀jáde |
| Join | Shiga | Dara pọ̀ |
| Joined | An shiga | Ti darapọ̀ |
| Settings | Saituna | Ètò |
| Account | Asusu | Àkọọ́lẹ̀ |
| Language | Harshe | Èdè |
| Safety | Tsaro | Ààbò |
| About | Game da | Nípa |
| Wifi-only downloads | Sauke ta Wifi kawai | Gba nípasẹ̀ Wifi nìkan |
| Panic hide | Ɓoye gaggawa | Fífarapamọ́ kánkán |
| Emergency contact | Lambar gaggawa | Olùbánisọ̀rọ̀ pàjáwìrì |
| Call | Kira | Pè |
| Today | Yau | Òní |
| Earlier this week | A makon nan da ya gabata | Ní ìbẹ̀rẹ̀ ọ̀sẹ̀ yìí |
| Amplify to Facebook | Fadada zuwa Facebook | Tàn kálẹ̀ sí Facebook |
| Amplify to LinkedIn | Fadada zuwa LinkedIn | Tàn kálẹ̀ sí LinkedIn |
| Trainer · Verified | Malami · An Tabbatar | Olùkọ́ni · Ti Jẹ́rìí |

**Ìgbò** was named as a fourth locale in the design handoff's language picker but no starter glossary is included here — source it the same way (native-speaker translation + review) before that locale ships; do not machine-translate it into the app.

## 14. Open items to flag back to the SheRISE team (do not silently decide these)

- **Deliverable is confirmed as a web app, not a native app.** Per the signed consulting agreement (Blue Sapphire Hub / SIF SheRISE, Aug 31 2026), the contracted deliverable is explicitly "a fully functional SheRISE web application (user-facing platform)" plus the admin M&E dashboard — there is no app-store listing, APK, or native build in scope or in the payment terms. The design handoff's phone-frame mockups (390×780) describe the target mobile *viewport*, not a native app; Section 3 above builds accordingly. If the SheRISE team later wants a store-distributed app, that's a new scope item to price and contract separately, not an assumption to build in now.
- Real photography is not ready — every `[ photo: ... ]` placeholder in the spec indicates crop/aspect/treatment only; do not ship placeholder art to production.
- The Hausa/Yorùbá strings above are a scaffolding starting point, not final copy — see Section 13 for the required native-speaker review before shipping. Ìgbò has no starter glossary yet.
- Facebook and LinkedIn app review has not started — both are multi-week processes; the cross-post feature must be buildable and testable without live approval (mock the provider in non-prod).
- SMS provider for broadcasts + OTP is not yet selected — build against an interface, not a specific vendor SDK.
- Pilot LGA is Ondo Central — seed any demo/test data accordingly.
- Whether the installed PWA icon should default to neutral (unbranded) rather than the SheRISE mark — see Section 5 — is a safety-relevant product decision the team should make explicitly, not one this prompt should decide on their behalf.