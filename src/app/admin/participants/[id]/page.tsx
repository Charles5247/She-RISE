"use client";
// Screen 27 — Participant detail. Left: identity card + private trainer notes.
// Right: 4 outcome KPIs, income sparkline, timeline. Wired to
// GET /api/admin/participants/{id}.
import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { Avatar } from "@/components/Avatar";
import { Spark } from "@/components/Spark";
import { LoadingState, ErrorState } from "@/components/States";
import { useSessionUser } from "@/lib/useSessionUser";
import { getJson } from "@/lib/apiClient";

interface DetailData {
  participant: {
    firstName: string;
    lastName: string | null;
    lga: string;
    skill: string;
    xpTotal: number;
    streak: number;
    age: number | null;
    joinedAt: string;
  };
  outcomes: { progressPercent: number; medalsCount: number; milestonesCount: number; firstIncomeTotal: number };
  incomeSparkline: number[];
  timeline: { kind: string; at: string; ref: string }[];
  trainerNotes: { id: string; note: string; trainer_first_name: string; created_at: string }[];
}

const cardBg = "var(--c-dark-card-bg)";
const border = "1px solid var(--c-dark-border)";
const soft = "var(--c-dark-text-soft)";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase();
}

export default function AdminParticipantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: userLoading } = useSessionUser({ loginPath: "/admin/login" });
  const [data, setData] = useState<DetailData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await getJson<DetailData>(`/api/admin/participants/${id}`);
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    setData(res.data);
  }, [id]);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount; load() sets state asynchronously after awaiting the API.
    load();
  }, [user, load]);

  if (userLoading) return <LoadingState label="Loading…" />;

  const fullName = data ? `${data.participant.firstName}${data.participant.lastName ? ` ${data.participant.lastName}` : ""}` : "";

  return (
    <AdminShell activeNav="participants" subtitle="Sep 2026" userName={user?.first_name ?? "Admin"} onExport={() => window.print()}>
      <button onClick={() => router.push("/admin/participants")} style={{ background: "none", border: "none", color: "var(--c-ink-soft)", fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 14 }}>
        ← Back to participants
      </button>

      {error && !data && <ErrorState message={error} onRetry={load} />}
      {!data && !error && <LoadingState label="Loading participant…" />}

      {data && (
        <div style={{ background: "var(--c-plum)", color: "var(--c-dark-text)", borderRadius: "var(--r-xl)", padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: 20 }}>
            {/* Left */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: 24, background: cardBg, border, borderRadius: "var(--r-lg)" }}>
                <div className="sr-label" style={{ fontSize: 10, color: "var(--c-gold)" }}>PARTICIPANT</div>
                <div style={{ marginTop: 12, display: "flex", gap: 14, alignItems: "center" }}>
                  <Avatar name={fullName} size={64} palette="bold" ring="var(--c-gold)" />
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, lineHeight: 1 }}>{fullName}</div>
                    <div style={{ fontSize: 11, color: soft, marginTop: 4, fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
                      {data.participant.age ? `${data.participant.age} · ` : ""}
                      {data.participant.lga?.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { l: "SKILL", v: data.participant.skill },
                    { l: "JOINED", v: fmtDate(data.participant.joinedAt) },
                    { l: "XP TOTAL", v: data.participant.xpTotal },
                    { l: "STREAK", v: `${data.participant.streak}d` },
                  ].map((s) => (
                    <div key={s.l} style={{ padding: "10px 12px", background: "rgba(232,184,74,0.06)", borderRadius: 4, border }}>
                      <div className="sr-label" style={{ fontSize: 9, color: "var(--c-gold)" }}>{s.l}</div>
                      <div style={{ marginTop: 3, fontSize: 13, fontFamily: "var(--font-display)", fontWeight: 700 }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: 20, background: cardBg, border, borderRadius: "var(--r-lg)" }}>
                <div className="sr-label" style={{ fontSize: 10, color: "var(--c-gold)" }}>TRAINER NOTES · PRIVATE</div>
                {data.trainerNotes.length === 0 && (
                  <div style={{ marginTop: 12, fontSize: 13, color: soft }}>No notes recorded yet.</div>
                )}
                {data.trainerNotes.map((n) => (
                  <div key={n.id} style={{ marginTop: 12 }}>
                    <div style={{ padding: 12, borderRadius: 4, background: "rgba(232,184,74,0.05)", fontWeight: 500, fontSize: 14, lineHeight: 1.5 }}>
                      &ldquo;{n.note}&rdquo;
                    </div>
                    <div style={{ marginTop: 6, fontSize: 10, color: soft, fontFamily: "var(--font-mono)" }}>
                      — {n.trainer_first_name?.toUpperCase()} · {fmtDate(n.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[
                  { l: "PATHWAY", v: `${data.outcomes.progressPercent}%`, tone: "var(--c-gold)" },
                  { l: "MEDALS", v: data.outcomes.medalsCount, tone: "var(--c-gold)" },
                  { l: "MILESTONES", v: data.outcomes.milestonesCount, tone: "var(--c-magenta)" },
                  { l: "1ST INCOME", v: `₦${data.outcomes.firstIncomeTotal.toLocaleString()}`, tone: "var(--c-gold)" },
                ].map((k) => (
                  <div key={k.l} style={{ padding: 14, background: cardBg, border, borderRadius: "var(--r-lg)" }}>
                    <div className="sr-label" style={{ fontSize: 9, color: "var(--c-gold)" }}>{k.l}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", lineHeight: 1, marginTop: 4, color: k.tone }}>{k.v}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: 20, background: cardBg, border, borderRadius: "var(--r-lg)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>Income</div>
                    <div style={{ fontSize: 11, color: soft, marginTop: 2 }}>Self-reported, trainer-verified</div>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  {data.incomeSparkline.length > 0 ? (
                    <Spark data={data.incomeSparkline} color="var(--c-gold)" width={560} height={80} />
                  ) : (
                    <div style={{ fontSize: 12, color: soft }}>No income reported yet.</div>
                  )}
                </div>
              </div>

              <div style={{ padding: 20, background: cardBg, border, borderRadius: "var(--r-lg)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>Timeline</div>
                <div style={{ marginTop: 16, position: "relative", paddingLeft: 24 }}>
                  <div style={{ position: "absolute", left: 8, top: 6, bottom: 6, width: 2, background: "rgba(232,184,74,0.2)" }} />
                  {data.timeline.length === 0 && <div style={{ fontSize: 12, color: soft }}>No activity yet.</div>}
                  {data.timeline.map((r, i) => (
                    <div key={i} style={{ marginBottom: 12, position: "relative" }}>
                      <div
                        style={{
                          position: "absolute",
                          left: -24,
                          top: 3,
                          width: 16,
                          height: 16,
                          borderRadius: 3,
                          background: r.kind === "post" ? "var(--c-magenta)" : "var(--c-gold)",
                          border: "2px solid var(--c-plum)",
                        }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 500, textTransform: "capitalize" }}>
                          {r.kind === "post" ? "Community post shared" : "Lesson completed"}
                        </div>
                        <div style={{ fontSize: 10, color: soft, fontFamily: "var(--font-mono)" }}>{fmtDate(r.at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
