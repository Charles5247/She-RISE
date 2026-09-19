"use client";
// Screen 25 — Admin dashboard home. KPI row + Priorities (top challenges) +
// Momentum (streaks) + "Where we're rising" LGA map-substitute. Wired to the
// existing GET /api/admin/overview (built in PR #1, untouched since).
import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { LoadingState, ErrorState } from "@/components/States";
import { FlameIcon } from "@/components/Icon";
import { useSessionUser } from "@/lib/useSessionUser";
import { getJson } from "@/lib/apiClient";

interface OverviewData {
  kpis: { totalRespondents: number; communities: number; lgas: number; women: number; men: number };
  topChallenges: { label: string; count: number }[];
  momentum: { participantsCount: number; activeStreaks: number; avgStreak: number };
  map: { lga: string; c: number }[];
}

const cardBg = "var(--c-dark-card-bg)";
const border = "1px solid var(--c-dark-border)";
const soft = "var(--c-dark-text-soft)";

export default function AdminOverviewPage() {
  const { user, loading: userLoading } = useSessionUser({ loginPath: "/admin/login" });
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await getJson<OverviewData>("/api/admin/overview");
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    setData(res.data);
  }, []);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount; load() sets state asynchronously after awaiting the API.
    load();
  }, [user, load]);

  if (userLoading) return <LoadingState label="Loading…" />;

  const maxChallenge = data ? Math.max(...data.topChallenges.map((c) => c.count), 1) : 1;
  const topLga = data && data.map.length ? [...data.map].sort((a, b) => b.c - a.c)[0] : null;

  return (
    <AdminShell activeNav="overview" title="Overview" subtitle="MOVEMENT MODE" userName={user?.first_name ?? "Admin"} onExport={() => window.print()}>
      {error && !data && <ErrorState message={error} onRetry={load} />}
      {!data && !error && <LoadingState label="Loading dashboard…" />}
      {data && (
        <div style={{ background: "var(--c-plum)", color: "var(--c-dark-text)", borderRadius: "var(--r-xl)", padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                {[
                  { label: "Respondents", value: data.kpis.totalRespondents.toLocaleString(), tone: "var(--c-gold)" },
                  { label: "Communities", value: data.kpis.communities, tone: "var(--c-dark-text)" },
                  { label: "LGAs", value: data.kpis.lgas, tone: "var(--c-dark-text)" },
                  { label: "Women", value: data.kpis.women.toLocaleString(), tone: "var(--c-magenta)" },
                  { label: "Men", value: data.kpis.men.toLocaleString(), tone: "var(--c-dark-text)", hint: "allies · sponsors" },
                ].map((k) => (
                  <div key={k.label} style={{ background: cardBg, border, borderRadius: "var(--r-lg)", padding: "14px 14px 12px" }}>
                    <div className="sr-label" style={{ fontSize: 10, color: soft }}>{k.label}</div>
                    <div style={{ marginTop: 6, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, letterSpacing: "-0.03em", color: k.tone, lineHeight: 1 }}>{k.value}</div>
                    {k.hint && <div style={{ fontSize: 9, color: soft, fontStyle: "italic", marginTop: 4 }}>{k.hint}</div>}
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14, flex: 1 }}>
                <div style={{ background: cardBg, border, borderRadius: "var(--r-lg)", padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>Priorities</div>
                      <div style={{ fontSize: 12, color: soft, marginTop: 2 }}>Top challenges reported</div>
                    </div>
                    <div style={{ fontSize: 11, color: soft, fontFamily: "var(--font-mono)" }}>n = {data.kpis.totalRespondents.toLocaleString()}</div>
                  </div>
                  <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                    {data.topChallenges.map((row, i) => {
                      const pct = Math.round((row.count / maxChallenge) * 100);
                      return (
                        <div key={row.label} style={{ display: "grid", gridTemplateColumns: "24px 1fr auto", gap: 12, alignItems: "center" }}>
                          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--c-gold)" }}>
                            {String(i + 1).padStart(2, "0")}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{row.label}</div>
                            <div style={{ marginTop: 4, height: 5, background: "rgba(245,239,230,0.08)", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, var(--c-magenta), var(--c-gold))", borderRadius: 3 }} />
                            </div>
                          </div>
                          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--c-gold)" }}>{row.count}</div>
                        </div>
                      );
                    })}
                    {data.topChallenges.length === 0 && <div style={{ fontSize: 12, color: soft }}>No challenge data yet.</div>}
                  </div>
                </div>

                <div style={{ background: cardBg, border, borderRadius: "var(--r-lg)", padding: 20 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>Momentum</div>
                  <div style={{ fontSize: 12, color: soft, marginTop: 2 }}>Practice streaks</div>
                  <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { l: "Active participants", v: data.momentum.participantsCount, big: true },
                      { l: "Active streaks (7d+)", v: data.momentum.activeStreaks },
                      { l: "Avg. streak length", v: `${data.momentum.avgStreak}d` },
                    ].map((s, i) => (
                      <div
                        key={s.l}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 10, borderBottom: i < 2 ? "1px dashed var(--c-dark-border)" : "none" }}
                      >
                        <div>
                          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: s.big ? 30 : 22, color: s.big ? "var(--c-gold)" : "var(--c-dark-text)", lineHeight: 1 }}>{s.v}</div>
                          <div style={{ fontSize: 11, color: soft, marginTop: 2 }}>{s.l}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {topLga && (
                    <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: "var(--r-md)", background: "rgba(212,48,110,0.12)", border: "1px solid var(--c-magenta)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c-magenta)", fontWeight: 700 }}>
                        <FlameIcon size={12} /> Signal
                      </div>
                      <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.4 }}>
                        {topLga.lga} leads with {topLga.c} respondents. Consider a case study.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right column — LGA breakdown */}
            <div style={{ background: cardBg, border, borderRadius: "var(--r-lg)", padding: 20, display: "flex", flexDirection: "column" }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>Where we&apos;re rising</div>
                <div style={{ fontSize: 12, color: soft, marginTop: 2 }}>Respondents by LGA</div>
              </div>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                {[...data.map]
                  .sort((a, b) => b.c - a.c)
                  .map((row) => {
                    const maxC = Math.max(...data.map.map((m) => m.c), 1);
                    const pct = Math.round((row.c / maxC) * 100);
                    return (
                      <div key={row.lga}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span>{row.lga}</span>
                          <span style={{ fontFamily: "var(--font-mono)", color: "var(--c-gold)" }}>{row.c}</span>
                        </div>
                        <div style={{ marginTop: 4, height: 6, background: "rgba(245,239,230,0.08)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: "var(--c-gold)", borderRadius: 3 }} />
                        </div>
                      </div>
                    );
                  })}
                {data.map.length === 0 && <div style={{ fontSize: 12, color: soft }}>No LGA data yet.</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
