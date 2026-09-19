"use client";
// Screen 14 — Skill pathway home. Plum hero card for the user's current
// pathway + module list (done / current / locked states), plus other
// pathways below.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRightIcon, CheckIcon, PlayIcon, TabBar } from "@/components";
import { LoadingState, ErrorState } from "@/components/States";
import { getJson } from "@/lib/apiClient";

interface PathwayLesson {
  id: string;
  title: string;
  order_index: number;
  xp_value: number;
  status: string;
}

interface Pathway {
  id: string;
  title: string;
  skillCategory: string;
  description: string;
  lessons: PathwayLesson[];
  progressPercent: number;
  isCurrent: boolean;
}

function statusDot(status: string) {
  if (status === "done") return { bg: "var(--c-success)", icon: <CheckIcon size={12} style={{ color: "#fff" }} /> };
  if (status === "current") return { bg: "var(--c-gold)", icon: <PlayIcon size={11} style={{ color: "var(--c-plum)" }} /> };
  return { bg: "var(--c-line)", icon: null };
}

function PathwayCard({ p, hero }: { p: Pathway; hero: boolean }) {
  return (
    <div
      style={{
        borderRadius: "var(--r-xxl)",
        padding: 18,
        background: hero ? "var(--c-plum)" : "#fff",
        color: hero ? "var(--c-dark-text)" : "var(--c-ink)",
        border: hero ? "none" : "1px solid var(--c-line)",
        boxShadow: hero ? "var(--shadow-card-magenta)" : "none",
      }}
    >
      <div className="sr-label" style={{ fontSize: 10, color: hero ? "var(--c-gold)" : "var(--c-ink-soft)", marginBottom: 6 }}>
        {hero ? "Your pathway" : p.skillCategory}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800 }}>{p.title}</div>
      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{p.description}</div>

      <div style={{ marginTop: 14, height: 6, borderRadius: "var(--r-pill)", background: hero ? "rgba(255,255,255,0.15)" : "var(--c-cream)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${p.progressPercent}%`, background: "linear-gradient(90deg, var(--c-magenta), var(--c-gold))" }} />
      </div>
      <div style={{ fontSize: 11, marginTop: 6, opacity: 0.8 }}>{p.progressPercent}% complete</div>

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {p.lessons.map((l) => {
          const dot = statusDot(l.status);
          return (
            <Link
              key={l.id}
              href={`/lessons/${l.id}`}
              style={{ display: "flex", alignItems: "center", gap: 10, opacity: l.status === "locked" ? 0.5 : 1 }}
            >
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: dot.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {dot.icon}
              </div>
              <div style={{ flex: 1, fontSize: 13 }}>{l.title}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{l.xp_value} XP</div>
            </Link>
          );
        })}
      </div>

      <Link
        href={`/pathways/${p.id}`}
        className="sr-label"
        style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 14, fontSize: 10, color: hero ? "var(--c-gold)" : "var(--c-magenta)", fontWeight: 800 }}
      >
        View pathway <ChevronRightIcon size={14} />
      </Link>
    </div>
  );
}

export default function PathwaysPage() {
  const [pathways, setPathways] = useState<Pathway[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await getJson<{ pathways: Pathway[] }>("/api/pathways");
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    setPathways(res.data.pathways);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount; load() sets state asynchronously after awaiting the API.
    load();
  }, [load]);

  if (error && !pathways) return <ErrorState message={error} onRetry={load} />;
  if (!pathways) return <LoadingState label="Loading pathways…" />;

  const current = pathways.filter((p) => p.isCurrent);
  const others = pathways.filter((p) => !p.isCurrent);

  return (
    <main style={{ minHeight: "100vh", background: "var(--c-cream)", paddingBottom: 100 }}>
      <header style={{ padding: "20px 16px 8px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>Learn</div>
      </header>
      <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        {current.map((p) => (
          <PathwayCard key={p.id} p={p} hero />
        ))}
        {others.length > 0 && (
          <>
            <div className="sr-label" style={{ fontSize: 10, color: "var(--c-ink-soft)", marginTop: 8 }}>
              Other pathways
            </div>
            {others.map((p) => (
              <PathwayCard key={p.id} p={p} hero={false} />
            ))}
          </>
        )}
      </div>
      <TabBar />
    </main>
  );
}
