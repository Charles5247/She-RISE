"use client";
// Screen 02 — Welcome carousel. First-run-only 3-slide value prop, shown
// once between the preloader and signup for brand-new, not-yet-onboarded
// visitors. Matches the design reference (SheRISE Bold - Design Reference.
// html, C2Welcome, lines 2655-2698) structure exactly: SKIP / n-of-3 header,
// full-bleed photo with a numbered badge, two-line display headline (second
// line in magenta), supporting copy, dot pagination, Continue button.
//
// Slide 2 of 3 is fully specified in the reference ("02 · Skill" badge,
// "Learn a skill. Own the money.") and is reproduced verbatim below.
// Slides 1 and 3 are NOT in the design reference file — their copy was
// written for this build to match slide 2's exact badge+headline+subtitle
// structure and the app's established dignity-first, non-clinical voice
// (see design-principles.md #01 "Dignity before data" and #07 "Named
// reactions, not likes"). Reported verbatim to the requester rather than
// buried in the diff, per instructions:
//   Slide 1 — "01 · Community" — "Meet your sisters. / Cheer each other on."
//   Slide 3 — "03 · Progress"  — "Track every rise. / Own your story."
//
// First-run gating: this screen only shows once. It sets a `sherise_`-
// prefixed sessionStorage flag (matching the precedent already used by
// /signup, /verify, /forgot-password), and the preloader checks that flag
// before ever routing here again. Already-onboarded users never reach this
// screen at all — the preloader routes them straight to /feed based on
// SessionUser.onboarding_complete, before this component ever mounts.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Photo, PButton, ChevronRightIcon } from "@/components";

interface Slide {
  badge: string;
  photoLabel: string;
  headline: [string, string];
  body: string;
}

const SLIDES: Slide[] = [
  {
    badge: "01 · Community",
    photoLabel: "women celebrating together",
    headline: ["Meet your sisters.", "Cheer each other on."],
    body: "Share your wins, big or small. No likes here — just cheers, holds, and celebrations, named the way real support sounds.",
  },
  {
    badge: "02 · Skill",
    photoLabel: "women in workshop",
    headline: ["Learn a skill.", "Own the money."],
    body: "Tailoring, catering, hairdressing — pick one and finish it your way. Every lesson works offline.",
  },
  {
    badge: "03 · Progress",
    photoLabel: "woman reviewing her progress",
    headline: ["Track every rise.", "Own your story."],
    body: "Streaks, medals, and milestones — all yours, never shared unless you choose to share them.",
  },
];

function finishWelcome(router: ReturnType<typeof useRouter>) {
  sessionStorage.setItem("sherise_seen_welcome", "1");
  router.replace("/signup");
}

export default function WelcomePage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  function handleContinue() {
    if (isLast) {
      finishWelcome(router);
      return;
    }
    setIndex((i) => i + 1);
  }

  function handleSkip() {
    finishWelcome(router);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--c-off)",
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={handleSkip}
          style={{
            fontSize: 13,
            color: "var(--c-ink-soft)",
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            background: "none",
            border: "none",
            padding: 0,
          }}
        >
          SKIP
        </button>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: "var(--c-magenta)",
          }}
        >
          {index + 1} / {SLIDES.length}
        </div>
        <div style={{ fontSize: 13, color: "transparent", width: 32 }}>SKIP</div>
      </div>

      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ borderRadius: 8, overflow: "hidden", height: 340, position: "relative" }}>
          <Photo label={slide.photoLabel} tone="var(--c-magenta-deep)" dark style={{ height: "100%", borderRadius: 8 }} />
          <div style={{ position: "absolute", top: 14, left: 14 }}>
            <div
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                background: "var(--c-gold)",
                color: "var(--c-plum)",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              {slide.badge}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "30px 22px 20px" }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 44,
            lineHeight: 0.92,
            letterSpacing: "-0.03em",
            color: "var(--c-ink)",
          }}
        >
          {slide.headline[0]}
          <br />
          <span style={{ color: "var(--c-magenta)" }}>{slide.headline[1]}</span>
        </div>
        <div style={{ marginTop: 14, fontSize: 14, lineHeight: 1.55, color: "var(--c-ink-soft)", maxWidth: 320 }}>
          {slide.body}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ padding: "0 22px 30px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {SLIDES.map((_, i) => (
            <div
              key={i}
              style={{ flex: 1, height: 3, background: i === index ? "var(--c-magenta)" : "var(--c-cream-deep)" }}
            />
          ))}
        </div>
        <PButton label="Continue" onClick={handleContinue} icon={<ChevronRightIcon size={16} />} size="lg" />
      </div>
    </main>
  );
}
