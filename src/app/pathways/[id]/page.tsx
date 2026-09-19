"use client";
// Pathway detail — full module list for one pathway (screen-inventory's
// "#/training-home" concept expanded to a per-pathway drill-down).
import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, CheckIcon, PlayIcon, ClockIcon } from "@/components";
import { LoadingState, ErrorState } from "@/components/States";
import { getJson } from "@/lib/apiClient";

interface LessonRow {
  id: string;
  title: string;
  xpValue: number;
  orderIndex: number;
  durationSeconds: number;
  status: string;
  downloadedOffline: boolean;
}

interface PathwayRow {
  id: string;
  title: string;
  skill_category: string;
  description: string;
}

function statusDot(status: string) {
  if (status === "done") return { bg: "var(--c-success)", icon: <CheckIcon size={13} style={{ color: "#fff" }} /> };
  if (status === "current") return { bg: "var(--c-gold)", icon: <PlayIcon size={12} style={{ color: "var(--c-plum)" }} /> };
  return { bg: "var(--c-line)", icon: null };
}

function fmtDuration(seconds: number) {
  const m = Math.round(seconds / 60);
  return `${m} min`;
}

export default function PathwayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [pathway, setPathway] = useState<PathwayRow | null>(null);
  const [lessons, setLessons] = useState<LessonRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await getJson<{ pathway: PathwayRow; lessons: LessonRow[] }>(`/api/pathways/${id}`);
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    setPathway(res.data.pathway);
    setLessons(res.data.lessons);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount; load() sets state asynchronously after awaiting the API.
    load();
  }, [load]);

  if (error && !pathway) return <ErrorState message={error} onRetry={load} />;
  if (!pathway || !lessons) return <LoadingState label="Loading pathway…" />;

  return (
    <main style={{ minHeight: "100vh", background: "var(--c-off)", paddingBottom: 32 }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 16px",
          borderBottom: "1px solid var(--c-line)",
          position: "sticky",
          top: 0,
          background: "var(--c-off)",
          zIndex: 10,
        }}
      >
        <button onClick={() => router.back()} aria-label="Back" style={{ color: "var(--c-ink)", width: 44, height: 44 }}>
          <ChevronLeftIcon size={22} />
        </button>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16 }}>{pathway.title}</div>
      </header>

      <div style={{ padding: 16 }}>
        <p style={{ fontSize: 13, color: "var(--c-ink-soft)", marginBottom: 16 }}>{pathway.description}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lessons.map((l) => {
            const dot = statusDot(l.status);
            const locked = l.status === "locked";
            return (
              <Link
                key={l.id}
                href={locked ? "#" : `/lessons/${l.id}`}
                onClick={(e) => locked && e.preventDefault()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 14,
                  background: "#fff",
                  border: "1px solid var(--c-line)",
                  borderRadius: "var(--r-lg)",
                  opacity: locked ? 0.55 : 1,
                }}
              >
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: dot.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {dot.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{l.title}</div>
                  <div style={{ fontSize: 11, color: "var(--c-ink-soft)", marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
                    <ClockIcon size={12} /> {fmtDuration(l.durationSeconds)} · {l.xpValue} XP
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
