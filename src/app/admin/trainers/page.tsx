"use client";
// Screen 32 — Trainers & sponsors. Left: trainer table w/ rating. Right:
// sponsor cards (women sponsored, since year). Wired to GET /api/admin/trainers.
import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { Avatar } from "@/components/Avatar";
import { SparkIcon } from "@/components/Icon";
import { LoadingState, ErrorState } from "@/components/States";
import { useSessionUser } from "@/lib/useSessionUser";
import { getJson } from "@/lib/apiClient";

interface Trainer {
  id: string;
  first_name: string;
  last_name: string;
  lga: string;
  specialty: string;
  rating: number;
  notes_written: number;
}
interface Sponsor {
  id: string;
  first_name: string;
  last_name: string;
  women_sponsored_count: number;
  sponsor_since_year: number;
}
interface TrainersData {
  trainers: Trainer[];
  sponsors: Sponsor[];
}

export default function AdminTrainersPage() {
  const { user, loading: userLoading } = useSessionUser({ loginPath: "/admin/login" });
  const [data, setData] = useState<TrainersData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await getJson<TrainersData>("/api/admin/trainers");
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

  return (
    <AdminShell activeNav="trainers" title="Trainers & sponsors" userName={user?.first_name ?? "Admin"}>
      {error && !data && <ErrorState message={error} onRetry={load} />}
      {!data && !error && <LoadingState label="Loading…" />}

      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
          <div style={{ padding: 24, background: "#fff", border: "1px solid var(--c-line)", borderRadius: "var(--r-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22 }}>Trainers</div>
              <button
                style={{
                  padding: "6px 12px",
                  borderRadius: 4,
                  background: "var(--c-magenta)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Invite
              </button>
            </div>
            <div style={{ marginTop: 12 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.4fr 1.4fr 70px 60px",
                  padding: "10px 16px",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  color: "var(--c-gold-deep)",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  background: "var(--c-plum)",
                  borderRadius: "var(--r-md) var(--r-md) 0 0",
                }}
              >
                <div style={{ color: "var(--c-gold)" }}>NAME</div>
                <div style={{ color: "var(--c-gold)" }}>LGA</div>
                <div style={{ color: "var(--c-gold)" }}>SPECIALTY</div>
                <div style={{ color: "var(--c-gold)" }}>NOTES</div>
                <div style={{ color: "var(--c-gold)" }}>★</div>
              </div>
              {data.trainers.map((t) => {
                const fullName = `${t.first_name} ${t.last_name}`;
                return (
                  <div
                    key={t.id}
                    style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1.4fr 70px 60px", padding: "12px 16px", borderTop: "1px solid var(--c-line)", alignItems: "center" }}
                  >
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Avatar name={fullName} size={26} palette="bold" ring="var(--c-gold)" />
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{fullName}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--c-ink-soft)" }}>{t.lga}</div>
                    <div style={{ fontSize: 12 }}>{t.specialty}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--c-gold-deep)" }}>{t.notes_written}</div>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <SparkIcon size={12} style={{ color: "var(--c-gold-deep)" }} />
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{Number(t.rating).toFixed(1)}</div>
                    </div>
                  </div>
                );
              })}
              {data.trainers.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "var(--c-ink-soft)", fontSize: 13 }}>No trainers yet.</div>}
            </div>
          </div>

          <div style={{ padding: 24, background: "#fff", border: "1px solid var(--c-line)", borderRadius: "var(--r-lg)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22 }}>Sponsors</div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {data.sponsors.map((s) => {
                const fullName = `${s.first_name} ${s.last_name}`;
                return (
                  <div key={s.id} style={{ padding: "12px 14px", borderRadius: 6, background: "var(--c-cream)", border: "1px solid var(--c-line)", display: "flex", gap: 12, alignItems: "center" }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 4,
                        background: "var(--c-gold)",
                        color: "var(--c-plum)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      {s.first_name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{fullName}</div>
                      <div style={{ fontSize: 9, color: "var(--c-ink-soft)", marginTop: 2, letterSpacing: "0.14em", fontWeight: 700 }}>
                        SPONSOR · SINCE {s.sponsor_since_year}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--c-gold-deep)" }}>{s.women_sponsored_count.toLocaleString()}</div>
                      <div style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--c-ink-soft)" }}>WOMEN</div>
                    </div>
                  </div>
                );
              })}
              {data.sponsors.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "var(--c-ink-soft)", fontSize: 13 }}>No sponsors yet.</div>}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
