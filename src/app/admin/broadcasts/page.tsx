"use client";
// Screen 31 — Broadcasts. Left: compose (audience/title/body). Right: sent
// recently with reach + open-rate. Wired to GET/POST /api/admin/broadcasts.
import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { FormField } from "@/components/FormField";
import { PButton } from "@/components/PButton";
import { LoadingState, ErrorState } from "@/components/States";
import { useSessionUser } from "@/lib/useSessionUser";
import { getJson, postJson } from "@/lib/apiClient";
import { NIGERIA_STATES } from "@/lib/nigeria-locations";

interface Broadcast {
  id: string;
  title: string;
  body: string;
  audience_filter: string;
  reach_count: number;
  open_count: number;
  sent_at: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase();
}

export default function AdminBroadcastsPage() {
  const { user, loading: userLoading } = useSessionUser({ loginPath: "/admin/login" });
  const [broadcasts, setBroadcasts] = useState<Broadcast[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState("");
  const [audience, setAudience] = useState("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sentToast, setSentToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await getJson<{ broadcasts: Broadcast[] }>("/api/admin/broadcasts");
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    setBroadcasts(res.data.broadcasts);
  }, []);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount; load() sets state asynchronously after awaiting the API.
    load();
  }, [user, load]);

  if (userLoading) return <LoadingState label="Loading…" />;

  async function send() {
    if (!title.trim() || !body.trim()) {
      setSendError("Title and body are required.");
      return;
    }
    setSending(true);
    setSendError(null);
    const res = await postJson<{ ok: boolean; reach: number }>("/api/admin/broadcasts", {
      audienceFilter: audience,
      title: title.trim(),
      body: body.trim(),
    });
    setSending(false);
    if (!res.ok || !res.data) {
      setSendError(res.message);
      return;
    }
    setSentToast(`Sent to ${res.data.reach} recipients.`);
    setTitle("");
    setBody("");
    load();
    setTimeout(() => setSentToast(null), 4000);
  }

  return (
    <AdminShell activeNav="broadcasts" title="Broadcasts" subtitle="Announcements to circles, cohorts, or the platform" userName={user?.first_name ?? "Admin"}>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
        <div style={{ padding: 24, background: "#fff", border: "1px solid var(--c-line)", borderRadius: "var(--r-lg)" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22 }}>Compose broadcast</div>
          <div style={{ fontSize: 12, color: "var(--c-ink-soft)", marginTop: 4 }}>Cannot include program-history language.</div>

          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label className="sr-label" style={{ fontSize: 10, color: "var(--c-gold-deep)", display: "block", marginBottom: 6 }}>
                AUDIENCE
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={stateFilter}
                  onChange={(e) => {
                    const nextState = e.target.value;
                    setStateFilter(nextState);
                    // The API only matches an exact lga (or skill_category), not a
                    // whole state — so picking a state narrows the LGA dropdown
                    // below to that state's real LGAs; it never sends on its own.
                    setAudience(nextState ? (NIGERIA_STATES.find((s) => s.name === nextState)?.lgas[0] ?? "all") : "all");
                  }}
                  style={{ flex: 1, padding: "10px 12px", borderRadius: 6, border: "1px solid var(--c-line)", fontSize: 13 }}
                >
                  <option value="">All participants (nationwide)</option>
                  {NIGERIA_STATES.map((s) => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
                {stateFilter && (
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    style={{ flex: 1, padding: "10px 12px", borderRadius: 6, border: "1px solid var(--c-line)", fontSize: 13 }}
                  >
                    {NIGERIA_STATES.find((s) => s.name === stateFilter)?.lgas.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                )}
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: "var(--c-ink-soft)" }}>
                {stateFilter
                  ? `Targeting participants in ${audience}, ${stateFilter}.`
                  : "Targeting all participants nationwide."}
              </div>
            </div>
            <FormField label="Title" value={title} onChange={setTitle} placeholder="Week 4 gathering — bring your offcuts" />
            <div>
              <label className="sr-label" style={{ fontSize: 10, color: "var(--c-gold-deep)", display: "block", marginBottom: 6 }}>
                BODY
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                placeholder="Sisters — Friday at 10am we'll practice on real work. See you then."
                style={{ width: "100%", padding: "12px 14px", borderRadius: 4, border: "1px solid var(--c-line)", fontSize: 13, lineHeight: 1.5, resize: "vertical" }}
              />
            </div>
            {sendError && <div style={{ fontSize: 12, color: "var(--c-danger)" }}>{sendError}</div>}
            {sentToast && <div style={{ fontSize: 12, color: "var(--c-success)" }}>{sentToast}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: 180 }}>
                <PButton label={sending ? "Sending…" : "Send broadcast"} onClick={send} disabled={sending} size="sm" />
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: 20, background: "#fff", border: "1px solid var(--c-line)", borderRadius: "var(--r-lg)" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18 }}>Sent recently</div>
          {error && !broadcasts && <ErrorState message={error} onRetry={load} />}
          {!broadcasts && !error && <LoadingState label="Loading…" />}
          {broadcasts && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              {broadcasts.map((b) => (
                <div key={b.id} style={{ padding: "12px 14px", borderRadius: 6, background: "var(--c-cream)", border: "1px solid var(--c-line)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{b.title}</div>
                    <div style={{ fontSize: 10, color: "var(--c-ink-soft)", fontFamily: "var(--font-mono)" }}>{fmtDate(b.sent_at)}</div>
                  </div>
                  <div style={{ marginTop: 4, fontSize: 11, color: "var(--c-ink-soft)" }}>
                    {b.reach_count.toLocaleString()} recipients ·{" "}
                    <b style={{ color: "var(--c-gold-deep)" }}>{b.reach_count ? Math.round((b.open_count / b.reach_count) * 100) : 0}%</b> opened
                  </div>
                </div>
              ))}
              {broadcasts.length === 0 && <div style={{ fontSize: 12, color: "var(--c-ink-soft)", marginTop: 12 }}>No broadcasts sent yet.</div>}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
