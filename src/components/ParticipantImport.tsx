"use client";
import { useState } from "react";
import { postJson } from "@/lib/apiClient";
type Preview = { firstName: string; lastName: string; email: string | null; phone: string | null; language: string };
export function ParticipantImport({ onImported }: { onImported: () => Promise<void> }) {
  const [csv, setCsv] = useState("");
  const [rows, setRows] = useState<Preview[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [version, setVersion] = useState(0);
  async function submit(confirm: boolean) {
    setBusy(true); setError(""); setNotice("");
    const result = await postJson<{ preview: Preview[]; count: number }>("/api/admin/users/import", { csv, confirm });
    setBusy(false);
    if (!result.ok || !result.data) { setError(result.message); setRows([]); return; }
    if (!confirm) setRows(result.data.preview);
    else { setNotice(`${result.data.count} participants registered. They can sign in immediately without OTP.`); setCsv(""); setRows([]); setVersion(v => v + 1); await onImported(); }
  }
  return <section className="sr-portal-card" style={{ marginBottom: 20 }}>
    <h2>Import participants from CSV</h2>
    <p>Up to 100 participants per file. Choose their passwords and language (ha, yo, pcm, en). Accounts are created together only after confirmation. Existing accounts are never overwritten.</p>
    <a className="sr-portal-link" href="/templates/participants.csv" download>Download CSV template</a>
    <p>Use the template, not a database/auth-table export. Passwords are hashed when saved. Keep the source file private and remove it once credentials have been handed over securely.</p>
    <div className="sr-portal-form">
      <label>Participant CSV<input key={version} type="file" accept=".csv,text/csv" disabled={busy} onChange={async e => { setRows([]); setCsv(""); setNotice(""); setError(""); const f = e.target.files?.[0]; if (!f) return; if (f.size > 1024 * 1024) { setError("Maximum file size is 1 MB."); return; } try { setCsv(await f.text()); } catch { setError("Could not read this file."); } }} /></label>
      <button className="sr-admin-menu-button" disabled={!csv || busy} onClick={() => void submit(false)}>{busy ? "Working..." : "Preview import"}</button>
      {error && <p role="alert" className="sr-portal-error">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {!!rows.length && <><p>{rows.length} participants ready to create. Passwords are not shown in the preview.</p><div className="sr-import-preview" role="region" aria-label="CSV preview" tabIndex={0}><table><thead><tr><th>Name</th><th>Sign-in</th><th>Language</th></tr></thead><tbody>{rows.map((r, i) => <tr key={i}><td>{r.firstName} {r.lastName}</td><td>{r.phone || r.email}</td><td>{r.language}</td></tr>)}</tbody></table></div><button className="sr-admin-menu-button" disabled={busy} onClick={() => void submit(true)}>Create {rows.length} participant accounts</button></>}
    </div>
  </section>;
}
