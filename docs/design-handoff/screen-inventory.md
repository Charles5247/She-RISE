# Screen inventory — SheRISE Bold & Empowering

35 screens total. Each row includes the route hash (matches `prototype/` and the standalone HTML), primary purpose, and key components.

## Onboarding & Auth · mobile 390×780

| Route | Screen | Primary purpose | Key components |
|---|---|---|---|
| `#/preloader` | Preloader | Brand impression while app boots | `<Phone>`, gold "SR" logo, magenta ambient blob, progress bar |
| `#/welcome` | Welcome carousel | 3-slide value prop | `<Phone>`, `<Photo>`, dot pagination, `<PButton>` |
| `#/signup` | Sign up | Phone or email + T&C | `<C2AuthShell>`, `<FormField>` × 2, T&C checkbox, `<PButton>` |
| `#/otp` | Verify code | 6-digit OTP input | `<C2AuthShell>`, 6 input tiles, resend timer, `<PButton>` × 2 |
| `#/create-profile` | Create profile | Name, LGA, avatar | `<C2AuthShell>`, `<Avatar>` w/ camera overlay, `<FormField>` × 4 |
| `#/pick-path` | Language + Skill (2 phones side-by-side) | Language then skill picker | Radio cards for language, 6-tile grid for skill |
| `#/login` | Login | Phone/email + password | `<FormField>` × 2, trainer login sub-CTA |
| `#/forgot` | Forgot password | Reset link | `<FormField>`, safety reassurance card, `<PButton>` × 2 |

## Participant App · mobile 390×780

| Route | Screen | Primary purpose | Key components |
|---|---|---|---|
| `#/feed` | Community feed | Milestone-first feed | Story bar (avatars w/ gold ring), hero milestone card (plum, gold pill, gradient fade), compact post below, `<TabBar>` |
| `#/composer` | Feed composer + amplify | Post + optional cross-post | Milestone tag chip row (gold on plum), `<Photo>` attach, FB / LinkedIn toggle cards, preview strip |
| `#/post-detail` | Post detail | Comments + reactions | Hero photo, action bar (magenta filled heart), comment list with trainer badge |
| `#/notifications` | Notifications | Grouped by day | Avatar with kind-badge, "Today" / "Earlier this week" section labels |
| `#/circles` | Circles directory | Browse & join | Filter chips, tabular list with join/joined pill |
| `#/training-home` | Skill pathway home | Current pathway + modules | Plum hero card, module list (done / current / locked states) |
| `#/lesson` | Lesson detail | Video + XP bar + steps | Streak counter pill, XP progress bar (magenta→gold gradient), lesson complete headline |
| `#/lesson-complete` | Lesson complete | Celebrate | Gold radial medal, XP / streak / accuracy tri-card, next lesson CTA |
| `#/progress` | Progress tracker | Ring + medals grid | `<Ring>` (gold on plum), streak/earned/medals triad, medals grid (4-col, earned = filled) |
| `#/milestone` | Milestone detail | Story of one milestone | Plum hero card with amount + verifier, 3-cell stats grid, story quote |
| `#/profile` | My profile | Identity + linked social | Plum hero card with avatar+gold ring, medals/streak/earned triad, FB (on) + LinkedIn (off) rows |
| `#/edit-profile` | Edit profile | Inline field edits | Avatar w/ camera, `<FormField>` × 4 |
| `#/settings` | Settings | Account/data/safety/about groups | Grouped rows, toggles for wifi-only, panic hide, log-out CTA |
| `#/trainer-chat` | 1:1 trainer DM | Verified chat thread | Message bubbles (magenta for me, white for them), typing composer |
| `#/help-safety` | Help & safety | Emergency + panic hide | Magenta emergency card w/ call button, gold-outlined panic hide row |

## Admin Web · desktop 1440

Every admin screen uses `<AdminShell>` (top nav: Overview · Participants · Referrals · Content · Perception · Reports · Broadcasts · Trainers, + 30d/90d/YTD/All range picker, + Export PDF CTA, + avatar).

| Route | Screen | Primary purpose | Key components |
|---|---|---|---|
| `#/admin-login` | Admin login | Trainer / sponsor / staff sign-in | Split 50/50, plum left half with "Every rise, on record" hero, form right half in cream |
| `#/admin-overview` | Dashboard home | KPI + Priorities + Momentum + Map | 5 KPI cards (Respondents / Communities / LGAs / Women / Men), Priorities ranked list w/ magenta→gold bars, Momentum streak card, Nigeria map (dark plum, gold dots) |
| `#/admin-participants` | Participants list | Filter + tabular | Filter tabs pill row, 8-col data table (name, LGA, cohort, skill, progress bar, medals, streak, status) |
| `#/admin-participant` | Participant detail | One woman, deep | Left column: identity card + trainer notes (private). Right column: 4 outcome KPIs, income sparkline (+184%), timeline w/ colored dots |
| `#/admin-referrals` | Referral pipeline | Funnel deep-dive | 4-step funnel (Referred → Screened → Eligible → Enrolled) with red drop-off deltas between, 3 drop-off reason cards below, top LGA conversion ranked list, "Signal" card in magenta border |
| `#/admin-content` | Content library | Manage lessons | Filter chips row, 3-col grid of lesson cards (thumbnail, path/module tag, title, dur/views/completion) |
| `#/admin-reports` | Reports & exports | Funder-ready | 5-row standard reports list w/ Download button, custom export builder w/ field checkboxes |
| `#/admin-broadcasts` | Broadcasts | Compose + history | Left: audience/title/body composer, Right: sent recently panel with reach + open-rate |
| `#/admin-trainers` | Trainers & sponsors | Directory | Left: trainer table w/ ratings, Right: sponsor cards (women sponsored, since year) |

## States

| Route | Screen | Trigger |
|---|---|---|
| `#/empty-feed` | Empty feed | Newcomer's first login before joining any circles or posting |
| `#/no-wifi` | Offline mode | Device is offline; shows downloaded lessons only |
| `#/error` | Error / retry | Network request failed; unsent posts stay safe |
