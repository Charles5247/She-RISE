"use client";
// Screen 29 — Content library. Pathway filter chips + 3-col lesson-card grid
// with duration/views/completion. Wired to GET /api/admin/content?pathway=
import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { Photo } from "@/components/Photo";
import { LoadingState, ErrorState } from "@/components/States";
import { useSessionUser } from "@/lib/useSessionUser";
import { getJson } from "@/lib/apiClient";

interface Lesson {
  id: string;
  title: string;
  duration_seconds: number;
  xp_value: number;
  pathway_title: string;
  skill_category: string;
  views: number | null;
  completion_rate: number | null;
}
interface Pathway {
  id: string;
  title: string;
  skill_category: string;
}
interface ContentData {
  lessons: Lesson[];
  pathways: Pathway[];
}

function fmtDur(sec: number) {
  const m = Math.round(sec / 60);
  return `${m} min`;
}

export default function AdminContentPage() {
  const { user, loading: userLoading } = useSessionUser({ loginPath: "/admin/login" });
  const [data, setData] = useState<ContentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pathwayId, setPathwayId] = useState("");

  const load = useCallback(async () => {
    setError(null);
    const qs = pathwayId ? `?pathway=${pathwayId}` : "";
    const res = await getJson<ContentData>(`/api/admin/content${qs}`);
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    setData(res.data);
  }, [pathwayId]);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount / filter refetch; load() sets state asynchronously after awaiting the API.
    load();
  }, [user, load]);

  if (userLoading) return <LoadingState label="Loading…" />;

  return (
    <AdminShell
      activeNav="content"
      title="Content library"
      subtitle={data ? `${data.lessons.length} lessons · ${data.pathways.length} pathways` : undefined}
      userName={user?.first_name ?? "Admin"}
      onExport={() => window.print()}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center", paddingBottom: 16, flexWrap: "wrap" }}>
        <button
          onClick={() => setPathwayId("")}
          style={{
            padding: "7px 14px",
            border: "1px solid var(--c-line)",
            borderRadius: 6,
            background: pathwayId === "" ? "var(--c-gold)" : "#fff",
            color: pathwayId === "" ? "var(--c-plum)" : "var(--c-ink-soft)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.06em",
            cursor: "pointer",
          }}
        >
          ALL PATHWAYS
        </button>
        {data?.pathways.map((p) => (
          <button
            key={p.id}
            onClick={() => setPathwayId(p.id)}
            style={{
              padding: "7px 14px",
              border: "1px solid var(--c-line)",
              borderRadius: 6,
              background: pathwayId === p.id ? "var(--c-gold)" : "#fff",
              color: pathwayId === p.id ? "var(--c-plum)" : "var(--c-ink-soft)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              cursor: "pointer",
            }}
          >
            {p.title.toUpperCase()}
          </button>
        ))}
      </div>

      {error && !data && <ErrorState message={error} onRetry={load} />}
      {!data && !error && <LoadingState label="Loading content…" />}

      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {data.lessons.map((l) => (
            <div key={l.id} style={{ background: "#fff", border: "1px solid var(--c-line)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
              <Photo label={l.title} tone="var(--c-magenta-deep)" dark aspectRatio="16/9" />
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--c-gold-deep)", fontWeight: 700 }}>
                  {l.skill_category?.toUpperCase()}
                </div>
                <div style={{ marginTop: 6, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, lineHeight: 1.2 }}>{l.title}</div>
                <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
                  {[
                    { l: "DUR", v: fmtDur(l.duration_seconds) },
                    { l: "VIEWS", v: (l.views ?? 0).toLocaleString() },
                    { l: "DONE", v: `${Math.round((l.completion_rate ?? 0) * 100)}%` },
                  ].map((s) => (
                    <div key={s.l}>
                      <div style={{ fontSize: 9, color: "var(--c-ink-soft)", letterSpacing: "0.14em", fontWeight: 700 }}>{s.l}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {data.lessons.length === 0 && <div style={{ gridColumn: "1 / -1", padding: 40, textAlign: "center", color: "var(--c-ink-soft)" }}>No lessons found.</div>}
        </div>
      )}
    </AdminShell>
  );
}
