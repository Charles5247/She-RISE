"use client";
// Screen 28 — Referral pipeline. 4-step funnel with drop-off deltas, 3
// drop-off reason cards, top LGA conversion, "Signal" insight card.
// Wired to GET /api/admin/referrals?range=30d|90d|ytd|all
import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { ChevronRightIcon } from "@/components/Icon";
import { LoadingState, ErrorState } from "@/components/States";
import { useSessionUser } from "@/lib/useSessionUser";
import { getJson } from "@/lib/apiClient";

interface ReferralsData {
  funnel: { stage: string; count: number; dropOff: number; dropOffPercent: number }[];
  dropOffReasons: { reason: string; count: number }[];
  topLgaConversion: { lga: string; total: number; enrolled: number; conversionPercent: number }[];
  signal: string;
}

const cardBg = "var(--c-dark-card-bg)";
const border = "1px solid var(--c-dark-border)";
const soft = "var(--c-dark-text-soft)";

const RANGES = [
  { key: "30d", label: "30d" },
  { key: "90d", label: "90d" },
  { key: "ytd", label: "YTD" },
  { key: "all", label: "All" },
];

const STAGE_TONE: Record<string, { bg: string; fg: string }> = {
  referred: { bg: "rgba(245,239,230,0.06)", fg: "var(--c-dark-text)" },
  screened: { bg: "rgba(232,184,74,0.15)", fg: "var(--c-dark-text)" },
  eligible: { bg: "rgba(212,48,110,0.2)", fg: "var(--c-dark-text)" },
  enrolled: { bg: "var(--c-magenta)", fg: "#fff" },
};

export default function AdminReferralsPage() {
  const { user, loading: userLoading } = useSessionUser({ loginPath: "/admin/login" });
  const [data, setData] = useState<ReferralsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState("90d");

  const load = useCallback(async () => {
    setError(null);
    const res = await getJson<ReferralsData>(`/api/admin/referrals?range=${range}`);
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    setData(res.data);
  }, [range]);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount / range-change refetch; load() sets state asynchronously after awaiting the API.
    load();
  }, [user, load]);

  if (userLoading) return <LoadingState label="Loading…" />;

  const enrolled = data?.funnel.find((f) => f.stage === "enrolled");
  const referred = data?.funnel.find((f) => f.stage === "referred");
  const convPercent = enrolled && referred && referred.count ? Math.round((enrolled.count / referred.count) * 100) : 0;

  return (
    <AdminShell
      activeNav="referrals"
      title="Referral pipeline"
      subtitle={`Last ${range}`}
      userName={user?.first_name ?? "Admin"}
      onExport={() => window.print()}
      right={
        <div style={{ display: "flex", border: "1px solid var(--c-line)", borderRadius: 6, overflow: "hidden" }}>
          {RANGES.map((r, i) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              style={{
                padding: "6px 14px",
                fontSize: 11,
                fontWeight: 700,
                border: "none",
                borderRight: i < RANGES.length - 1 ? "1px solid var(--c-line)" : "none",
                background: range === r.key ? "var(--c-gold)" : "transparent",
                color: range === r.key ? "var(--c-plum)" : "var(--c-ink-soft)",
                cursor: "pointer",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      }
    >
      {error && !data && <ErrorState message={error} onRetry={load} />}
      {!data && !error && <LoadingState label="Loading referrals…" />}

      {data && (
        <div style={{ background: "var(--c-plum)", color: "var(--c-dark-text)", borderRadius: "var(--r-xl)", padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: 24, background: cardBg, border, borderRadius: "var(--r-lg)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22 }}>Referred → Enrolled</div>
                  <div style={{ fontSize: 11, color: "var(--c-gold)", fontFamily: "var(--font-mono)" }}>CONV · {convPercent}%</div>
                </div>

                <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr", alignItems: "center", gap: 4 }}>
                  {data.funnel.map((s, i) => {
                    const tone = STAGE_TONE[s.stage] ?? STAGE_TONE.referred;
                    const pct = referred?.count ? Math.round((s.count / referred.count) * 100) : 0;
                    return (
                      <div key={s.stage} style={{ display: "contents" }}>
                        {i > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            <ChevronRightIcon size={20} style={{ color: soft }} />
                            <div style={{ fontSize: 9, color: "#EF6E6E", fontFamily: "var(--font-mono)" }}>-{s.dropOffPercent}%</div>
                          </div>
                        )}
                        <div style={{ background: tone.bg, color: tone.fg, padding: "22px 16px", borderRadius: 6, textAlign: "center", border: tone.fg === "#fff" ? "none" : border }}>
                          <div style={{ fontSize: 9, letterSpacing: "0.16em", opacity: 0.9, fontWeight: 700, textTransform: "uppercase" }}>{s.stage}</div>
                          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, letterSpacing: "-0.03em", marginTop: 4, lineHeight: 1 }}>
                            {s.count.toLocaleString()}
                          </div>
                          <div style={{ fontSize: 11, marginTop: 4, opacity: 0.9, fontFamily: "var(--font-mono)" }}>{pct}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {data.dropOffReasons.map((r) => (
                    <div key={r.reason} style={{ padding: 14, background: "rgba(232,184,74,0.06)", borderRadius: 6, border }}>
                      <div style={{ fontSize: 9, color: "var(--c-gold)", letterSpacing: "0.14em", fontWeight: 700 }}>DROP</div>
                      <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>{r.reason}</div>
                      <div style={{ marginTop: 6, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>{r.count.toLocaleString()}</div>
                    </div>
                  ))}
                  {data.dropOffReasons.length === 0 && <div style={{ fontSize: 12, color: soft }}>No drop-off data yet.</div>}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: 20, background: cardBg, border, borderRadius: "var(--r-lg)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>Top LGA conversion</div>
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                  {data.topLgaConversion.map((r, i) => (
                    <div
                      key={r.lga}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 10, borderBottom: i < data.topLgaConversion.length - 1 ? "1px dashed var(--c-dark-border)" : "none" }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{r.lga}</div>
                        <div style={{ fontSize: 10, color: soft, marginTop: 2, fontFamily: "var(--font-mono)" }}>{r.enrolled} ENROLLED</div>
                      </div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--c-gold)" }}>{r.conversionPercent}%</div>
                    </div>
                  ))}
                  {data.topLgaConversion.length === 0 && <div style={{ fontSize: 12, color: soft }}>No LGA data yet.</div>}
                </div>
              </div>

              <div style={{ padding: 20, background: "rgba(212,48,110,0.15)", border: "2px solid var(--c-magenta)", borderRadius: "var(--r-lg)" }}>
                <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "var(--c-magenta)", fontWeight: 700 }}>SIGNAL</div>
                <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5 }}>{data.signal}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
