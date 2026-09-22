"use client";
// Screen 19 — My profile. Plum hero card with avatar+gold ring, medals/
// streak/earned triad, FB (on) + LinkedIn (off) rows, links to edit/settings.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, ChevronRightIcon, FacebookIcon, LinkedInIcon, FlameIcon, MedalIcon, TabBar } from "@/components";
import { LoadingState, ErrorState } from "@/components/States";
import { getJson } from "@/lib/apiClient";

interface Profile {
  firstName: string;
  lastName: string | null;
  bio: string | null;
  lga: string | null;
  avatarUrl: string | null;
  xpTotal: number;
  streakCount: number;
  medalsEarned: number;
  fbConnected: boolean;
  liConnected: boolean;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await getJson<{ profile: Profile }>("/api/me/profile");
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    setProfile(res.data.profile);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount; load() sets state asynchronously after awaiting the API.
    load();
  }, [load]);

  if (error && !profile) return <ErrorState message={error} onRetry={load} />;
  if (!profile) return <LoadingState label="Loading profile…" />;

  return (
    <main style={{ minHeight: "100vh", background: "var(--c-cream)", paddingBottom: 100 }}>
      <div
        style={{
          margin: 16,
          borderRadius: "var(--r-xxl)",
          background: "var(--c-plum)",
          color: "var(--c-dark-text)",
          padding: 24,
          textAlign: "center",
          boxShadow: "var(--shadow-card-magenta)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Avatar name={profile.firstName} size={84} palette="bold" ring="var(--c-gold)" imageUrl={profile.avatarUrl} />
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, marginTop: 12 }}>{profile.firstName}</div>
        {profile.lga && <div style={{ fontSize: 12, color: "var(--c-dark-text-soft)", marginTop: 2 }}>{profile.lga}</div>}
        {profile.bio && <div style={{ fontSize: 13, marginTop: 10, color: "var(--c-dark-text-soft)" }}>{profile.bio}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          {[
            { icon: <FlameIcon size={16} style={{ color: "var(--c-gold)" }} />, label: "Streak", value: `${profile.streakCount}d` },
            { icon: null, label: "XP earned", value: profile.xpTotal },
            { icon: <MedalIcon size={16} style={{ color: "var(--c-gold)" }} />, label: "Medals", value: profile.medalsEarned },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: "var(--r-lg)", padding: "12px 8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>
                {s.icon}
                {s.value}
              </div>
              <div className="sr-label" style={{ fontSize: 9, marginTop: 4, opacity: 0.75 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/profile/edit"
          className="sr-label"
          style={{ display: "inline-block", marginTop: 16, fontSize: 10, fontWeight: 800, color: "var(--c-gold)" }}
        >
          Edit profile
        </Link>
      </div>

      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 14,
            background: "#fff",
            border: "1px solid var(--c-line)",
            borderRadius: "var(--r-lg)",
          }}
        >
          <FacebookIcon size={20} style={{ color: "var(--c-facebook)" }} />
          <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>Facebook</div>
          <div className="sr-label" style={{ fontSize: 10, fontWeight: 800, color: profile.fbConnected ? "var(--c-success)" : "var(--c-ink-soft)" }}>
            {profile.fbConnected ? "Connected" : "Not connected"}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 14,
            background: "#fff",
            border: "1px solid var(--c-line)",
            borderRadius: "var(--r-lg)",
          }}
        >
          <LinkedInIcon size={20} style={{ color: "var(--c-linkedin)" }} />
          <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>LinkedIn</div>
          <div className="sr-label" style={{ fontSize: 10, fontWeight: 800, color: profile.liConnected ? "var(--c-success)" : "var(--c-ink-soft)" }}>
            {profile.liConnected ? "Connected" : "Not connected"}
          </div>
        </div>

        <Link
          href="/settings"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 14,
            background: "#fff",
            border: "1px solid var(--c-line)",
            borderRadius: "var(--r-lg)",
            marginTop: 6,
          }}
        >
          <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>Settings</div>
          <ChevronRightIcon size={16} style={{ color: "var(--c-ink-soft)" }} />
        </Link>
        <Link
          href="/help-safety"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 14,
            background: "#fff",
            border: "1px solid var(--c-line)",
            borderRadius: "var(--r-lg)",
          }}
        >
          <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>Help &amp; safety</div>
          <ChevronRightIcon size={16} style={{ color: "var(--c-ink-soft)" }} />
        </Link>
      </div>
      <TabBar />
    </main>
  );
}
