"use client";
// Screen — Community perception (M&E Section 8 dataset). Not in the static
// design reference (added after the core 9-screen admin set was drafted), so
// this follows the same visual language as the other admin screens: plum
// panel, gold/magenta bars, wave + LGA filters. Wired to
// GET /api/admin/perception?wave=baseline|midline&lga=. The `dataQuality`
// block is admin-only (enumerator monitoring) — rendered only when present.
import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { LoadingState, ErrorState } from "@/components/States";
import { useSessionUser } from "@/lib/useSessionUser";
import { getJson } from "@/lib/apiClient";

interface TallyRow {
  label: string;
  count: number;
  percent: number;
}
interface PerceptionData {
  geographicCoverage: { totalRespondents: number; byLga: Record<string, number>; targetLgas: number };
  communityPerceptionStigma: { acceptanceLevels: TallyRow[]; stigmaReportedPercent: number; discriminationTypes: TallyRow[] };
  challenges: TallyRow[];
  digitalSkillsDemand: TallyRow[];
  psychosocial: { wantsCounsellingPercent: number };
  communityReadiness: { willingToSupportPercent: number; willingToReferPercent: number };
  wave: string;
  dataQuality?: {
    interviewsPerEnumerator: { enumeratorId: string; count: number }[];
    duplicateSubmissions: number;
    avgDurationSeconds: number;
  };
}

const cardBg = "var(--c-dark-card-bg)";
const border = "1px solid var(--c-dark-border)";
const soft = "var(--c-dark-text-soft)";

const LGAS = ["Ondo Central", "Ondo West", "Ondo East", "Akure South", "Owo", "Ile Oluji"];

function Bars({ rows, tone = "var(--c-gold)" }: { rows: TallyRow[]; tone?: string }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map((r) => (
        <div key={r.label}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ textTransform: "capitalize" }}>{r.label.replace(/_/g, " ")}</span>
            <span style={{ fontFamily: "var(--font-mono)", color: tone }}>{r.percent}%</span>
          </div>
          <div style={{ marginTop: 4, height: 6, background: "rgba(245,239,230,0.08)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(r.count / max) * 100}%`, background: tone, borderRadius: 3 }} />
          </div>
        </div>
      ))}
      {rows.length === 0 && <div style={{ fontSize: 12, color: soft }}>No responses yet.</div>}
    </div>
  );
}

export default function AdminPerceptionPage() {
  const { user, loading: userLoading } = useSessionUser({ loginPath: "/admin/login" });
  const [data, setData] = useState<PerceptionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wave, setWave] = useState("baseline");
  const [lga, setLga] = useState("");

  const load = useCallback(async () => {
    setError(null);
    const params = new URLSearchParams({ wave });
    if (lga) params.set("lga", lga);
    const res = await getJson<PerceptionData>(`/api/admin/perception?${params.toString()}`);
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    setData(res.data);
  }, [wave, lga]);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount / filter refetch; load() sets state asynchronously after awaiting the API.
    load();
  }, [user, load]);

  if (userLoading) return <LoadingState label="Loading…" />;

  return (
    <AdminShell
      activeNav="perception"
      title="Community perception"
      subtitle={`${wave.toUpperCase()} wave`}
      userName={user?.first_name ?? "Admin"}
      onExport={() => window.print()}
      right={
        <div style={{ display: "flex", gap: 8 }}>
          <select value={wave} onChange={(e) => setWave(e.target.value)} style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid var(--c-line)", fontSize: 12 }}>
            <option value="baseline">Baseline</option>
            <option value="midline">Midline</option>
          </select>
          <select value={lga} onChange={(e) => setLga(e.target.value)} style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid var(--c-line)", fontSize: 12 }}>
            <option value="">All LGAs</option>
            {LGAS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      }
    >
      {error && !data && <ErrorState message={error} onRetry={load} />}
      {!data && !error && <LoadingState label="Loading survey data…" />}

      {data && (
        <div style={{ background: "var(--c-plum)", color: "var(--c-dark-text)", borderRadius: "var(--r-xl)", padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
            {[
              { l: "RESPONDENTS", v: data.geographicCoverage.totalRespondents.toLocaleString(), tone: "var(--c-gold)" },
              { l: "STIGMA REPORTED", v: `${data.communityPerceptionStigma.stigmaReportedPercent}%`, tone: "var(--c-danger)" },
              { l: "WANT COUNSELLING", v: `${data.psychosocial.wantsCounsellingPercent}%`, tone: "var(--c-gold)" },
              { l: "WILLING TO REFER", v: `${data.communityReadiness.willingToReferPercent}%`, tone: "var(--c-magenta)" },
            ].map((k) => (
              <div key={k.l} style={{ background: cardBg, border, borderRadius: "var(--r-lg)", padding: "14px 14px 12px" }}>
                <div className="sr-label" style={{ fontSize: 10, color: soft }}>{k.l}</div>
                <div style={{ marginTop: 6, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: k.tone, lineHeight: 1 }}>{k.v}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ background: cardBg, border, borderRadius: "var(--r-lg)", padding: 20 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18 }}>Community acceptance</div>
              <div style={{ fontSize: 11, color: soft, marginTop: 2, marginBottom: 14 }}>Self-reported by respondents</div>
              <Bars rows={data.communityPerceptionStigma.acceptanceLevels} tone="var(--c-gold)" />
            </div>

            <div style={{ background: cardBg, border, borderRadius: "var(--r-lg)", padding: 20 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18 }}>Top challenges</div>
              <div style={{ fontSize: 11, color: soft, marginTop: 2, marginBottom: 14 }}>Main challenge cited</div>
              <Bars rows={data.challenges} tone="var(--c-magenta)" />
            </div>

            <div style={{ background: cardBg, border, borderRadius: "var(--r-lg)", padding: 20 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18 }}>Discrimination types reported</div>
              <div style={{ fontSize: 11, color: soft, marginTop: 2, marginBottom: 14 }}>Among those reporting stigma</div>
              <Bars rows={data.communityPerceptionStigma.discriminationTypes} tone="var(--c-danger)" />
            </div>

            <div style={{ background: cardBg, border, borderRadius: "var(--r-lg)", padding: 20 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18 }}>Digital skills demand</div>
              <div style={{ fontSize: 11, color: soft, marginTop: 2, marginBottom: 14 }}>What women want to learn next</div>
              <Bars rows={data.digitalSkillsDemand} tone="var(--c-gold)" />
            </div>
          </div>

          <div style={{ marginTop: 14, background: cardBg, border, borderRadius: "var(--r-lg)", padding: 20 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18 }}>Respondents by LGA</div>
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {Object.entries(data.geographicCoverage.byLga).map(([l, c]) => (
                <div key={l} style={{ padding: "10px 12px", borderRadius: 6, background: "rgba(245,239,230,0.04)", border }}>
                  <div className="sr-label" style={{ fontSize: 9, color: soft }}>{l.toUpperCase()}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--c-gold)" }}>{c}</div>
                </div>
              ))}
              {Object.keys(data.geographicCoverage.byLga).length === 0 && <div style={{ fontSize: 12, color: soft }}>No LGA data yet.</div>}
            </div>
          </div>

          {data.dataQuality && (
            <div style={{ marginTop: 14, background: "rgba(212,48,110,0.12)", border: "1px solid var(--c-magenta)", borderRadius: "var(--r-lg)", padding: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "var(--c-magenta)", fontWeight: 700 }}>DATA QUALITY · ADMIN ONLY</div>
              <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                <div>
                  <div className="sr-label" style={{ fontSize: 9, color: soft }}>DUPLICATE SUBMISSIONS</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>{data.dataQuality.duplicateSubmissions}</div>
                </div>
                <div>
                  <div className="sr-label" style={{ fontSize: 9, color: soft }}>AVG. INTERVIEW LENGTH</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>{Math.round(data.dataQuality.avgDurationSeconds / 60)} min</div>
                </div>
                <div>
                  <div className="sr-label" style={{ fontSize: 9, color: soft }}>ENUMERATORS ACTIVE</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>{data.dataQuality.interviewsPerEnumerator.length}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
