"use client";
// Screens 15 & 16 — Lesson detail (video + XP bar + steps) and Lesson
// complete (celebration: gold medal, XP/streak/accuracy tri-card, next
// lesson CTA). Combined into one route: completing the lesson swaps the
// view in place rather than navigating, since both need the same lesson data.
import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, FlameIcon, MedalIcon, PButton } from "@/components";
import { Photo } from "@/components/Photo";
import { LoadingState, ErrorState } from "@/components/States";
import { getJson, postJson } from "@/lib/apiClient";

interface LessonDetail {
  id: string;
  title: string;
  videoUrl480p: string;
  videoUrlHd: string;
  xpValue: number;
  durationSeconds: number;
  steps: string[];
}

interface Progress {
  status: string;
  downloadedOffline: boolean;
  accuracy: number | null;
}

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [result, setResult] = useState<{ xpAwarded: number; streakCount: number; totalXp: number } | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await getJson<{ lesson: LessonDetail; progress: Progress; streakCount: number }>(`/api/lessons/${id}`);
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    setLesson(res.data.lesson);
    setProgress(res.data.progress);
    setStreakCount(res.data.streakCount);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount; load() sets state asynchronously after awaiting the API.
    load();
  }, [load]);

  async function complete() {
    setCompleting(true);
    const res = await postJson<{ xpAwarded: number; streakCount: number; totalXp: number }>(`/api/lessons/${id}/complete`, {});
    setCompleting(false);
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    setResult(res.data);
  }

  if (error && !lesson) return <ErrorState message={error} onRetry={load} />;
  if (!lesson || !progress) return <LoadingState label="Loading lesson…" />;

  if (result) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "var(--c-plum)",
          color: "var(--c-dark-text)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          textAlign: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--c-gold), var(--c-gold-deep))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow-card-gold)",
          }}
        >
          <MedalIcon size={44} style={{ color: "var(--c-plum)" }} />
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>Lesson complete!</div>
          <div style={{ marginTop: 4, fontSize: 13, color: "var(--c-dark-text-soft)" }}>{lesson.title}</div>
        </div>
        <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 340 }}>
          {[
            { label: "XP earned", value: `+${result.xpAwarded}` },
            { label: "Streak", value: `${result.streakCount}d` },
            { label: "Total XP", value: result.totalXp },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: "var(--r-lg)", padding: "14px 8px" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--c-gold)" }}>{s.value}</div>
              <div className="sr-label" style={{ fontSize: 9, marginTop: 4, opacity: 0.8 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 8 }}>
          <PButton label="Back to pathway" onClick={() => router.back()} />
          <button onClick={() => router.push("/feed")} className="sr-label" style={{ fontSize: 10, color: "var(--c-dark-text-soft)", background: "none", border: "none" }}>
            Go to feed
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--c-off)", paddingBottom: 40 }}>
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
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, flex: 1 }}>{lesson.title}</div>
        <div
          className="sr-label"
          style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--c-gold-deep)", fontWeight: 800 }}
        >
          <FlameIcon size={14} /> {streakCount}d
        </div>
      </header>

      <Photo label="lesson video (480p default)" hint="▶" aspectRatio="16/9" />

      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div className="sr-label" style={{ fontSize: 10, color: "var(--c-ink-soft)" }}>
            XP for this lesson
          </div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>{lesson.xpValue} XP</div>
        </div>
        <div style={{ height: 8, borderRadius: "var(--r-pill)", background: "var(--c-cream)", overflow: "hidden", marginBottom: 20 }}>
          <div style={{ height: "100%", width: progress.status === "done" ? "100%" : "40%", background: "linear-gradient(90deg, var(--c-magenta), var(--c-gold))" }} />
        </div>

        <div className="sr-label" style={{ fontSize: 10, color: "var(--c-ink-soft)", marginBottom: 10 }}>
          Steps
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {(lesson.steps.length ? lesson.steps : ["Watch the video", "Practice the technique", "Reflect on what you learned"]).map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "var(--c-cream)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div style={{ paddingTop: 2 }}>{typeof s === "string" ? s : JSON.stringify(s)}</div>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-xs mb-3" style={{ color: "var(--c-danger)" }}>
            {error}
          </p>
        )}

        {progress.status === "done" ? (
          <div className="sr-label" style={{ textAlign: "center", fontSize: 11, color: "var(--c-success)", fontWeight: 800 }}>
            ✓ Completed
          </div>
        ) : (
          <PButton label={completing ? "Saving…" : "Mark lesson complete"} onClick={complete} disabled={completing} />
        )}
      </div>
    </main>
  );
}
