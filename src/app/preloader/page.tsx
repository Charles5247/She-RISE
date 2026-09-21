"use client";
// Screen 01 — Preloader. First frame while the app boots; brand impression
// only. Matches the design reference (SheRISE Bold - Design Reference.html,
// C2Preloader, lines 2624-2653) exactly: gold "SR" mark, "SHE." wordmark,
// "A movement." tagline, magenta ambient blob on plum, progress bar,
// "Loading your rise…" caption. No external asset dependencies — everything
// here is CSS/text, so nothing can fail to load and strand a user on this
// screen.
//
// Routing (the actual app entry point, see src/app/page.tsx which redirects
// here): checks /api/auth/me once, then decides where to go next —
//   - signed in + onboarding complete   -> /feed
//   - signed in + onboarding incomplete -> /onboarding/profile
//   - not signed in + carousel not seen -> /welcome
//   - not signed in + carousel seen     -> /signup
// The carousel "seen" flag lives in sessionStorage under the same
// `sherise_`-prefixed key convention already used by signup/verify/
// forgot-password (see src/app/welcome/page.tsx).
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getJson } from "@/lib/apiClient";
import type { SessionUserView } from "@/lib/useSessionUser";

export default function PreloaderPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(20);

  useEffect(() => {
    // Animate the progress bar a little so the screen doesn't feel static
    // even on a fast connection — purely cosmetic, not tied to real loading.
    const tick = setInterval(() => {
      setProgress((p) => (p >= 90 ? 90 : p + 14));
    }, 140);

    let cancelled = false;
    (async () => {
      const res = await getJson<{ user: SessionUserView }>("/api/auth/me");
      if (cancelled) return;
      setProgress(100);

      const next = () => {
        if (res.ok && res.data?.user) {
          router.replace(res.data.user.onboarding_complete ? "/feed" : "/onboarding/profile");
          return;
        }
        const seenWelcome = sessionStorage.getItem("sherise_seen_welcome");
        router.replace(seenWelcome ? "/signup" : "/welcome");
      };
      // Small delay so the brand frame is actually visible rather than
      // flashing past instantly on a warm cache / fast API response.
      setTimeout(next, 500);
    })();

    return () => {
      cancelled = true;
      clearInterval(tick);
    };
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, var(--c-plum) 0%, var(--c-plum-mid) 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,184,74,0.2), transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 12,
            background: "var(--c-gold)",
            color: "var(--c-plum)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: 44,
            letterSpacing: "-0.05em",
            boxShadow: "0 20px 40px -12px rgba(232,184,74,0.6)",
          }}
        >
          SR
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 56,
            letterSpacing: "-0.04em",
            color: "var(--c-dark-text)",
          }}
        >
          SHE<span style={{ color: "var(--c-gold)" }}>.</span>
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--c-gold)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
          }}
        >
          A movement.
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 96,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ width: 160, height: 3, background: "rgba(232,184,74,0.15)", overflow: "hidden" }}>
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "var(--c-gold)",
              transition: "width 0.14s linear",
            }}
          />
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.16em",
            color: "rgba(245,239,230,0.5)",
            textTransform: "uppercase",
          }}
        >
          Loading your rise…
        </div>
      </div>
    </main>
  );
}
