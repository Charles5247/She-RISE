"use client";
// Screen 13 — Circles directory. Filter chips (by LGA, client-side), tabular
// list with join/joined pill.
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, ChevronLeftIcon, Chip, EmptyState, TabBar } from "@/components";
import { LoadingState, ErrorState } from "@/components/States";
import { getJson, postJson, deleteJson } from "@/lib/apiClient";

interface Circle {
  id: string;
  name: string;
  description: string | null;
  lga: string | null;
  memberCount: number;
  joined: boolean;
}

export default function CirclesPage() {
  const router = useRouter();
  const [circles, setCircles] = useState<Circle[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterLga, setFilterLga] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await getJson<{ circles: Circle[] }>("/api/circles");
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    setCircles(res.data.circles);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount; load() sets state asynchronously after awaiting the API.
    load();
  }, [load]);

  const lgas = useMemo(() => Array.from(new Set((circles ?? []).map((c) => c.lga).filter(Boolean))) as string[], [circles]);
  const visible = useMemo(
    () => (circles ?? []).filter((c) => !filterLga || c.lga === filterLga),
    [circles, filterLga]
  );

  async function toggleJoin(c: Circle) {
    setPending(c.id);
    if (c.joined) await deleteJson(`/api/circles/${c.id}/join`);
    else await postJson(`/api/circles/${c.id}/join`);
    setPending(null);
    setCircles((prev) => prev?.map((x) => (x.id === c.id ? { ...x, joined: !x.joined, memberCount: x.memberCount + (x.joined ? -1 : 1) } : x)) ?? null);
  }

  if (error && !circles) return <ErrorState message={error} onRetry={load} />;
  if (!circles) return <LoadingState label="Loading circles…" />;

  return (
    <main style={{ minHeight: "100vh", background: "var(--c-off)", paddingBottom: 100 }}>
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
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16 }}>Circles</div>
      </header>

      {lgas.length > 0 && (
        <div className="sr-scroll-x" style={{ display: "flex", gap: 8, padding: "14px 16px" }}>
          <Chip label="All" on={filterLga === null} onClick={() => setFilterLga(null)} />
          {lgas.map((l) => (
            <Chip key={l} label={l} on={filterLga === l} onClick={() => setFilterLga(l)} />
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState title="No circles here yet" body="Check back soon, or try a different area." />
      ) : (
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {visible.map((c) => (
            <div
              key={c.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 14,
                background: "#fff",
                border: "1px solid var(--c-line)",
                borderRadius: "var(--r-lg)",
              }}
            >
              <Avatar name={c.name} size={44} palette="bold" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "var(--c-ink-soft)" }}>
                  {c.lga ? `${c.lga} · ` : ""}
                  {c.memberCount} member{c.memberCount === 1 ? "" : "s"}
                </div>
              </div>
              <button
                onClick={() => toggleJoin(c)}
                disabled={pending === c.id}
                className="sr-label"
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "8px 14px",
                  borderRadius: "var(--r-pill)",
                  background: c.joined ? "var(--c-cream)" : "var(--c-magenta)",
                  color: c.joined ? "var(--c-ink)" : "#fff",
                  border: c.joined ? "1px solid var(--c-line)" : "none",
                  minWidth: 72,
                }}
              >
                {c.joined ? "Joined" : "Join"}
              </button>
            </div>
          ))}
        </div>
      )}
      <TabBar />
    </main>
  );
}
