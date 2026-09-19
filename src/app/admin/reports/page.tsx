"use client";
// Screen 30 — Reports & exports. Standard reports list (download triggers an
// audited export via POST /api/admin/exports, which requires a documented
// `purpose` per the "all access is audited" rule) + custom export builder
// with field checkboxes.
import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { DownloadIcon } from "@/components/Icon";
import { PButton } from "@/components/PButton";
import { LoadingState, ErrorState } from "@/components/States";
import { useSessionUser } from "@/lib/useSessionUser";
import { getJson, postJson } from "@/lib/apiClient";

interface Report {
  id: string;
  name: string;
  description: string;
}

const CUSTOM_FIELDS = [
  { key: "first_name", label: "First name" },
  { key: "lga", label: "LGA" },
  { key: "skill_category", label: "Skill category" },
  { key: "xp_total", label: "XP total" },
  { key: "streak_count", label: "Streak count" },
  { key: "created_at", label: "Joined date" },
];

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReportsPage() {
  const { user, loading: userLoading } = useSessionUser({ loginPath: "/admin/login" });
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [purposeFor, setPurposeFor] = useState<string | null>(null);
  const [purpose, setPurpose] = useState("");
  const [exportError, setExportError] = useState<string | null>(null);
  const [customFields, setCustomFields] = useState<string[]>(["first_name", "lga"]);

  const load = useCallback(async () => {
    setError(null);
    const res = await getJson<{ reports: Report[] }>("/api/admin/reports");
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    setReports(res.data.reports);
  }, []);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount; load() sets state asynchronously after awaiting the API.
    load();
  }, [user, load]);

  if (userLoading) return <LoadingState label="Loading…" />;

  async function runExport(reportId: string, fields?: string[]) {
    if (!purpose.trim()) {
      setExportError("You must document a purpose before exporting.");
      return;
    }
    setPendingId(reportId);
    setExportError(null);
    const res = await postJson<{ ok: boolean; rowCount: number; data: unknown }>("/api/admin/exports", {
      reportId,
      purpose: purpose.trim(),
      fields,
    });
    setPendingId(null);
    if (!res.ok || !res.data) {
      setExportError(res.message);
      return;
    }
    downloadJson(`${reportId}-export.json`, res.data.data);
    setPurposeFor(null);
    setPurpose("");
  }

  function toggleField(key: string) {
    setCustomFields((prev) => (prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]));
  }

  return (
    <AdminShell activeNav="reports" title="Reports & exports" userName={user?.first_name ?? "Admin"}>
      {error && !reports && <ErrorState message={error} onRetry={load} />}
      {!reports && !error && <LoadingState label="Loading reports…" />}

      {reports && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ padding: 24, background: "#fff", border: "1px solid var(--c-line)", borderRadius: "var(--r-lg)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22 }}>Standard reports</div>
            <div style={{ fontSize: 12, color: "var(--c-ink-soft)", marginTop: 4 }}>
              All access is audited. Downloads require a documented purpose.
            </div>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {reports.map((r) => (
                <div key={r.id} style={{ borderRadius: "var(--r-md)", background: "var(--c-cream)", border: "1px solid var(--c-line)" }}>
                  <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
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
                        flexShrink: 0,
                      }}
                    >
                      <DownloadIcon size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 800 }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: "var(--c-ink-soft)", marginTop: 2 }}>{r.description}</div>
                    </div>
                    <button
                      onClick={() => {
                        setPurposeFor(purposeFor === r.id ? null : r.id);
                        setExportError(null);
                      }}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 4,
                        background: "var(--c-gold)",
                        color: "var(--c-plum)",
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Download
                    </button>
                  </div>
                  {purposeFor === r.id && (
                    <div style={{ padding: "0 16px 16px" }}>
                      <input
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="Document the purpose of this export (required)"
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid var(--c-line)", fontSize: 13 }}
                      />
                      {exportError && <div style={{ marginTop: 6, fontSize: 12, color: "var(--c-danger)" }}>{exportError}</div>}
                      <div style={{ marginTop: 8, width: 160 }}>
                        <PButton
                          label={pendingId === r.id ? "Exporting…" : "Confirm export"}
                          onClick={() => runExport(r.id)}
                          disabled={pendingId === r.id}
                          size="sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 24, background: "#fff", border: "1px solid var(--c-line)", borderRadius: "var(--r-lg)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22 }}>Custom export builder</div>
            <div style={{ fontSize: 12, color: "var(--c-ink-soft)", marginTop: 4 }}>Choose the participant fields to include.</div>
            <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 10 }}>
              {CUSTOM_FIELDS.map((f) => (
                <label
                  key={f.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--c-line)",
                    background: customFields.includes(f.key) ? "var(--c-cream)" : "#fff",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <input type="checkbox" checked={customFields.includes(f.key)} onChange={() => toggleField(f.key)} />
                  {f.label}
                </label>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <input
                value={purposeFor === "custom" ? purpose : ""}
                onFocus={() => setPurposeFor("custom")}
                onChange={(e) => {
                  setPurposeFor("custom");
                  setPurpose(e.target.value);
                }}
                placeholder="Document the purpose of this export (required)"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid var(--c-line)", fontSize: 13 }}
              />
              {purposeFor === "custom" && exportError && <div style={{ marginTop: 6, fontSize: 12, color: "var(--c-danger)" }}>{exportError}</div>}
            </div>
            <div style={{ marginTop: 12, width: 200 }}>
              <PButton
                label={pendingId === "custom" ? "Exporting…" : "Export custom fields"}
                variant="secondary"
                onClick={() => runExport("custom", customFields)}
                disabled={pendingId === "custom" || customFields.length === 0}
                size="sm"
              />
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
