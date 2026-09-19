"use client";
// Screen 23 — Help & safety. Magenta emergency card w/ call button,
// gold-outlined panic hide row (Design Principle 08).
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon, PhoneCallIcon, LockIcon, TabBar } from "@/components";
import { LoadingState } from "@/components/States";
import { getJson } from "@/lib/apiClient";

interface Trainer {
  id: string;
  firstName: string;
  specialty: string;
}

export default function HelpSafetyPage() {
  const router = useRouter();
  const [trainers, setTrainers] = useState<Trainer[] | null>(null);

  const load = useCallback(async () => {
    const res = await getJson<{ trainers: Trainer[] }>("/api/trainers");
    setTrainers(res.data?.trainers ?? []);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount; load() sets state asynchronously after awaiting the API.
    load();
  }, [load]);

  return (
    <main style={{ minHeight: "100vh", background: "var(--c-off)", paddingBottom: 100 }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 16px",
          borderBottom: "1px solid var(--c-line)",
        }}
      >
        <button onClick={() => router.back()} aria-label="Back" style={{ color: "var(--c-ink)", width: 44, height: 44 }}>
          <ChevronLeftIcon size={22} />
        </button>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16 }}>Help &amp; safety</div>
      </header>

      <div style={{ padding: 16 }}>
        <div
          style={{
            borderRadius: "var(--r-xxl)",
            background: "var(--c-magenta)",
            color: "#fff",
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div className="sr-label" style={{ fontSize: 10, opacity: 0.85, marginBottom: 6 }}>
            In an emergency
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
            You&apos;re not alone. Help is one tap away.
          </div>
          <a
            href="tel:112"
            className="sr-label"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: "var(--r-pill)",
              background: "#fff",
              color: "var(--c-magenta)",
              fontWeight: 800,
              fontSize: 12,
            }}
          >
            <PhoneCallIcon size={16} /> Call emergency line
          </a>
        </div>

        <div
          style={{
            border: "2px solid var(--c-gold)",
            borderRadius: "var(--r-lg)",
            padding: 16,
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <LockIcon size={20} style={{ color: "var(--c-gold-deep)" }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Panic hide</div>
            <div style={{ fontSize: 12, color: "var(--c-ink-soft)", lineHeight: 1.5 }}>
              Long-press the home indicator anytime to instantly hide SheRISE
              behind a neutral calculator screen. No branding, no trace in
              your app switcher. Manage this in{" "}
              <button onClick={() => router.push("/settings")} style={{ color: "var(--c-magenta)", fontWeight: 700, textDecoration: "underline" }}>
                Settings
              </button>
              .
            </div>
          </div>
        </div>

        <div className="sr-label" style={{ fontSize: 10, color: "var(--c-ink-soft)", marginBottom: 10 }}>
          Talk to a trainer
        </div>
        {trainers === null ? (
          <LoadingState label="Loading trainers…" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {trainers.map((t) => (
              <button
                key={t.id}
                onClick={() => router.push(`/trainer-chat/${t.id}`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 14,
                  background: "#fff",
                  border: "1px solid var(--c-line)",
                  borderRadius: "var(--r-lg)",
                  textAlign: "left",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{t.firstName}</div>
                  <div style={{ fontSize: 11, color: "var(--c-ink-soft)" }}>{t.specialty}</div>
                </div>
                <ChevronRightIcon size={16} style={{ color: "var(--c-ink-soft)" }} />
              </button>
            ))}
          </div>
        )}

        <div style={{ marginTop: 24, fontSize: 11, color: "var(--c-ink-soft)", lineHeight: 1.6 }}>
          Your program history is never shared outside SheRISE staff and your
          own trainer. Everything you post publicly is written by you, in
          your own words.
        </div>
      </div>
      <TabBar />
    </main>
  );
}
