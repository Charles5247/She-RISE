"use client";
// Screen 26 — Participants list. Filter chips (status/lga/skill) + 8-col
// table (name, LGA, cohort/skill, skill, progress bar, medals, streak, status).
// Wired to GET /api/admin/participants?lga=&skill=&status=
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { Avatar } from "@/components/Avatar";
import { FlameIcon } from "@/components/Icon";
import { LoadingState, ErrorState } from "@/components/States";
import { useSessionUser } from "@/lib/useSessionUser";
import { getJson } from "@/lib/apiClient";
import { ALL_LGAS } from "@/lib/nigeria-locations";

interface Participant {
  id: string;
  firstName: string;
  lastName: string | null;
  lga: string;
  cohort: string;
  skill: string;
  progressPercent: number;
  medals: number;
  streak: number;
  status: "active" | "at_risk" | "completed";
}

const STATUS_TABS: { key: string; label: string }[] = [
  { key: "", label: "ALL" },
  { key: "active", label: "ACTIVE" },
  { key: "at_risk", label: "SUPPORT" },
  { key: "completed", label: "ALUMNAE" },
];

const STATUS_TONE: Record<string, { bg: string; fg: string; label: string }> = {
  active: { bg: "var(--c-gold)", fg: "var(--c-plum)", label: "ACTIVE" },
  at_risk: { bg: "var(--c-danger)", fg: "#fff", label: "SUPPORT" },
  completed: { bg: "var(--c-magenta)", fg: "#fff", label: "ALUMNA" },
};

const SKILLS = [
  "Tailoring & Fashion",
  "Catering & Baking",
  "Soap & Bead Making",
  "Digital Marketing",
  "Content Creation",
];

export default function AdminParticipantsPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useSessionUser({
    loginPath: "/admin/login",
  });
  const [rows, setRows] = useState<Participant[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [lga, setLga] = useState("");
  const [skill, setSkill] = useState("");

  const load = useCallback(async () => {
    setError(null);
    const params = new URLSearchParams();
    if (lga) params.set("lga", lga);
    if (skill) params.set("skill", skill);
    if (status) params.set("status", status);
    const qs = params.toString();
    const res = await getJson<{ participants: Participant[] }>(
      `/api/admin/participants${qs ? `?${qs}` : ""}`,
    );
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    setRows(res.data.participants);
  }, [lga, skill, status]);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount / filter-change refetch; load() sets state asynchronously after awaiting the API.
    load();
  }, [user, load]);

  if (userLoading) return <LoadingState label="Loading…" />;

  const cols = "2fr 1.4fr 1fr 1.4fr 1.4fr 90px 80px 100px";

  return (
    <AdminShell
      activeNav="participants"
      title="Participants"
      subtitle={`${rows?.length ?? "…"} shown`}
      userName={user?.first_name ?? "Admin"}
      onExport={() => window.print()}
      right={
        <div
          className="sr-admin-filter-row"
          style={{ display: "flex", gap: 8 }}
        >
          <select
            value={lga}
            onChange={(e) => setLga(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid var(--c-line)",
              fontSize: 12,
            }}
          >
            <option value="">All LGAs</option>
            {ALL_LGAS.map((l, i) => (
              // Index included in the key: a handful of LGA names legitimately
              // repeat across different states (e.g. "Nasarawa", "Obi"), so the
              // name alone isn't a unique React key here.
              <option key={`${l}-${i}`} value={l}>
                {l}
              </option>
            ))}
          </select>
          <select
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid var(--c-line)",
              fontSize: 12,
            }}
          >
            <option value="">All skills</option>
            {SKILLS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <div
        className="sr-admin-status-row"
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          paddingBottom: 16,
        }}
      >
        <div
          className="sr-admin-status-tabs"
          style={{
            display: "flex",
            border: "1px solid var(--c-line)",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          {STATUS_TABS.map((t, i) => (
            <button
              key={t.key}
              onClick={() => setStatus(t.key)}
              style={{
                padding: "7px 14px",
                fontSize: 11,
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                letterSpacing: "0.06em",
                borderRight:
                  i < STATUS_TABS.length - 1
                    ? "1px solid var(--c-line)"
                    : "none",
                background: status === t.key ? "var(--c-gold)" : "transparent",
                color: status === t.key ? "var(--c-plum)" : "var(--c-ink-soft)",
                border: "none",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {error && !rows && <ErrorState message={error} onRetry={load} />}
      {!rows && !error && <LoadingState label="Loading participants…" />}

      {rows && (
        <div
          className="sr-admin-table-wrap"
          style={{
            background: "#fff",
            border: "1px solid var(--c-line)",
            borderRadius: "var(--r-lg)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: cols,
              padding: "12px 20px",
              background: "var(--c-plum)",
              color: "var(--c-gold)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            <div>NAME</div>
            <div>LGA</div>
            <div>COHORT</div>
            <div>SKILL</div>
            <div>PROGRESS</div>
            <div>MEDALS</div>
            <div>STREAK</div>
            <div>STATUS</div>
          </div>
          {rows.map((r) => {
            const tone = STATUS_TONE[r.status] ?? STATUS_TONE.active;
            const fullName = `${r.firstName}${r.lastName ? ` ${r.lastName}` : ""}`;
            return (
              <button
                key={r.id}
                onClick={() => router.push(`/admin/participants/${r.id}`)}
                style={{
                  display: "grid",
                  gridTemplateColumns: cols,
                  padding: "14px 20px",
                  borderTop: "1px solid var(--c-line)",
                  alignItems: "center",
                  background: "transparent",
                  border: "none",
                  borderTopStyle: "solid",
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  color: "var(--c-ink)",
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Avatar name={fullName} size={30} palette="bold" />
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {fullName}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--c-ink-soft)" }}>
                  {r.lga}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    color: "var(--c-gold-deep)",
                  }}
                >
                  {r.cohort}
                </div>
                <div style={{ fontSize: 12 }}>{r.skill}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div
                    style={{
                      flex: 1,
                      height: 4,
                      background: "var(--c-cream-deep)",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${r.progressPercent}%`,
                        background:
                          "linear-gradient(90deg, var(--c-magenta), var(--c-gold))",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--c-gold-deep)",
                      fontFamily: "var(--font-mono)",
                      minWidth: 30,
                    }}
                  >
                    {r.progressPercent}%
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 16,
                    color: "var(--c-gold-deep)",
                  }}
                >
                  {r.medals}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    alignItems: "center",
                    fontSize: 12,
                  }}
                >
                  <FlameIcon size={12} style={{ color: "var(--c-magenta)" }} />
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                    }}
                  >
                    {r.streak}d
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      padding: "3px 10px",
                      borderRadius: 3,
                      background: tone.bg,
                      color: tone.fg,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {tone.label}
                  </span>
                </div>
              </button>
            );
          })}
          {rows.length === 0 && (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: "var(--c-ink-soft)",
                fontSize: 13,
              }}
            >
              No participants match these filters.
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
