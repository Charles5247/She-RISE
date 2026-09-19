"use client";
// Screen 17 — Progress tracker. Ring (gold on plum) + streak/earned/medals
// triad, medals grid (4-col, earned = filled), income sparkline, milestone list.
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FlameIcon, MedalIcon, Ring, Spark, TabBar } from "@/components";
import { LoadingState, ErrorState } from "@/components/States";
import { getJson } from "@/lib/apiClient";

interface Medal {
  code: string;
  label: string;
  earned: boolean;
}

interface MilestoneRow {
  id: string;
  type: string;
  amount: number | null;
  created_at: string;
}

interface ProgressData {
  xpTotal: number;
  streakCount: number;
  progressPercent: number;
  medalsEarned: number;
  medals: Medal[];
  milestones: MilestoneRow[];
  incomeLog: { amount: number; date: string }[];
}

export default function ProgressPage() {
  const router = useRouter();
  const [data, setData] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await getJson<ProgressData>("/api/me/progress");
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    setData(res.data);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount; load() sets state asynchronously after awaiting the API.
    load();
  }, [load]);

  if (error && !data) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <LoadingState label="Loading progress…" />;

  return (
    <main style={{ minHeight: "100vh", background: "var(--c-cream)", paddingBottom: 100 }}>
      <header style={{ padding: "20px 16px 8px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>Progress</div>
      </header>

      <div
        style={{
          margin: 16,
          borderRadius: "var(--r-xxl)",
          background: "var(--c-plum)",
          color: "var(--c-dark-text)",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          boxShadow: "var(--shadow-card-magenta)",
        }}
      >
        <Ring percent={data.progressPercent} size={128} stroke={10} color="var(--c-gold)" label={`${data.progressPercent}%`} sublabel="Complete" />
        <div style={{ display: "flex", width: "100%", gap: 10 }}>
          {[
            { icon: <FlameIcon size={16} style={{ color: "var(--c-gold)" }} />, label: "Streak", value: `${data.streakCount}d` },
            { icon: null, label: "XP earned", value: data.xpTotal },
            { icon: <MedalIcon size={16} style={{ color: "var(--c-gold)" }} />, label: "Medals", value: data.medalsEarned },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: "var(--r-lg)", padding: "12px 8px", textAlign: "center" }}>
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
      </div>

      <div style={{ padding: "0 16px" }}>
        <div className="sr-label" style={{ fontSize: 10, color: "var(--c-ink-soft)", marginBottom: 10 }}>
          Medals
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
          {data.medals.map((m) => (
            <div key={m.code} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: m.earned ? 1 : 0.35 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: m.earned ? "linear-gradient(135deg, var(--c-gold), var(--c-gold-deep))" : "var(--c-cream-deep)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MedalIcon size={22} style={{ color: m.earned ? "var(--c-plum)" : "var(--c-ink-soft)" }} />
              </div>
              <div style={{ fontSize: 9, textAlign: "center", color: "var(--c-ink-soft)", lineHeight: 1.2 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {data.incomeLog.length > 0 && (
          <>
            <div className="sr-label" style={{ fontSize: 10, color: "var(--c-ink-soft)", marginBottom: 10 }}>
              Income trend
            </div>
            <div style={{ background: "#fff", border: "1px solid var(--c-line)", borderRadius: "var(--r-lg)", padding: 16, marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
              <Spark data={data.incomeLog.map((i) => i.amount)} width={140} height={44} />
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>
                  ₦{data.incomeLog[data.incomeLog.length - 1]?.amount.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: "var(--c-ink-soft)" }}>Most recent income</div>
              </div>
            </div>
          </>
        )}

        {data.milestones.length > 0 && (
          <>
            <div className="sr-label" style={{ fontSize: 10, color: "var(--c-ink-soft)", marginBottom: 10 }}>
              Milestones
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.milestones.map((m) => (
                <button
                  key={m.id}
                  onClick={() => router.push(`/milestones/${m.id}`)}
                  style={{
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    padding: 14,
                    background: "#fff",
                    border: "1px solid var(--c-line)",
                    borderRadius: "var(--r-lg)",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>{m.type.replace(/_/g, " ")}</span>
                  {m.amount ? <span style={{ fontSize: 13, fontWeight: 700, color: "var(--c-gold-deep)" }}>₦{m.amount.toLocaleString()}</span> : null}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <TabBar />
    </main>
  );
}
