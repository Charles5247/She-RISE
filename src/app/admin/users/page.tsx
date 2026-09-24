"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { LoadingState, ErrorState } from "@/components/States";
import { useSessionUser } from "@/lib/useSessionUser";
import { deleteJson, getJson, patchJson, postJson } from "@/lib/apiClient";

interface ManagedUser { id: string; role: string; first_name: string; last_name: string | null; email: string | null; phone: string | null }
const fieldStyle = { width: "100%", padding: "10px 12px", border: "1px solid var(--c-line)", borderRadius: 6, background: "#fff", color: "var(--c-ink)" };

export default function AdminUsersPage() {
  const { user, loading: userLoading } = useSessionUser({ loginPath: "/admin/login", expectedRole: "admin" });
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const result = await getJson<{ users: ManagedUser[] }>("/api/admin/users");
    setLoading(false);
    if (result.ok && result.data) setUsers(result.data.users);
    else setError(result.message);
  }, []);
  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load() fetches remotely and updates state after its await.
    load();
  }, [user, load]);

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setNotice("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const result = await postJson("/api/admin/users", {
      firstName: form.get("firstName"), lastName: form.get("lastName"), email: form.get("email"), phone: form.get("phone"),
      role: form.get("role"), specialty: form.get("specialty"), password: form.get("password"),
    });
    if (!result.ok) { setError(result.message); return; }
    formElement.reset(); setNotice("Account created. Share the sign-in details securely."); await load();
  }

  async function saveAccount(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setError(""); setNotice("");
    const form = new FormData(event.currentTarget);
    const result = await patchJson(`/api/admin/users?id=${encodeURIComponent(id)}`, {
      firstName: form.get("firstName"), lastName: form.get("lastName"), email: form.get("email"), phone: form.get("phone"), password: form.get("password"),
    });
    if (!result.ok) { setError(result.message); return; }
    setNotice("Account updated."); await load();
  }

  async function removeAccount(target: ManagedUser) {
    if (!window.confirm(`Remove ${target.first_name} ${target.last_name ?? ""} and their account data? This cannot be undone.`)) return;
    const result = await deleteJson(`/api/admin/users?id=${encodeURIComponent(target.id)}`);
    if (!result.ok) { setError(result.message); return; }
    setNotice("Account removed."); await load();
  }

  if (userLoading) return <LoadingState label="Loading…" />;
  return (
    <AdminShell activeNav="users" title="User accounts" subtitle="CREATE, EDIT AND REMOVE ACCOUNTS" userName={user?.first_name ?? "Admin"}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 340px) 1fr", gap: 20, alignItems: "start" }}>
        <form onSubmit={createAccount} style={{ background: "#fff", border: "1px solid var(--c-line)", borderRadius: 10, padding: 18, display: "grid", gap: 10 }}>
          <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Create account</h2>
          <input name="firstName" placeholder="First name" required style={fieldStyle} />
          <input name="lastName" placeholder="Last name" style={fieldStyle} />
          <select name="role" style={fieldStyle} defaultValue="trainer"><option value="participant">Participant</option><option value="trainer">Trainer</option><option value="sponsor">Sponsor</option><option value="admin">Administrator</option></select>
          <input name="email" type="email" placeholder="Email address" style={fieldStyle} />
          <input name="phone" placeholder="Phone number" style={fieldStyle} />
          <input name="specialty" placeholder="Trainer specialty (if applicable)" style={fieldStyle} />
          <input name="password" type="password" placeholder="Temporary password (8+ characters)" minLength={8} required style={fieldStyle} />
          <button type="submit" style={{ padding: 11, background: "var(--c-magenta)", color: "white", border: 0, borderRadius: 6, fontWeight: 800, cursor: "pointer" }}>Create account</button>
        </form>

        <section style={{ background: "#fff", border: "1px solid var(--c-line)", borderRadius: 10, padding: 18 }}>
          <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>All accounts</h2>
          {error && <div role="alert" style={{ color: "var(--c-danger)", marginBottom: 12 }}>{error}</div>}
          {notice && <div role="status" style={{ color: "var(--c-success)", marginBottom: 12 }}>{notice}</div>}
          {loading && <LoadingState label="Loading accounts…" />}
          {!loading && users.length === 0 && <p style={{ color: "var(--c-ink-soft)" }}>No accounts found.</p>}
          <div style={{ display: "grid", gap: 10 }}>
            {users.map((account) => <details key={account.id} style={{ border: "1px solid var(--c-line)", borderRadius: 8, padding: 12 }}>
              <summary style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span><b>{account.first_name} {account.last_name}</b><span style={{ marginLeft: 10, color: "var(--c-ink-soft)", fontSize: 12 }}>{account.email || account.phone || "No login identifier"}</span></span>
                <span style={{ color: "var(--c-magenta)", textTransform: "uppercase", fontSize: 10, fontWeight: 800 }}>{account.role}</span>
              </summary>
              <form onSubmit={(event) => saveAccount(event, account.id)} style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(140px,1fr))", gap: 8, marginTop: 12 }}>
                <input name="firstName" aria-label="First name" defaultValue={account.first_name} required style={fieldStyle} />
                <input name="lastName" aria-label="Last name" defaultValue={account.last_name ?? ""} style={fieldStyle} />
                <input name="email" aria-label="Email" type="email" defaultValue={account.email ?? ""} style={fieldStyle} />
                <input name="phone" aria-label="Phone" defaultValue={account.phone ?? ""} style={fieldStyle} />
                <input name="password" aria-label="New password (optional)" type="password" placeholder="New password (optional)" minLength={8} style={fieldStyle} />
                <div style={{ display: "flex", gap: 8 }}><button type="submit" style={{ ...fieldStyle, background: "var(--c-plum)", color: "white", fontWeight: 700, cursor: "pointer" }}>Save</button><button type="button" onClick={() => removeAccount(account)} style={{ ...fieldStyle, width: "auto", color: "var(--c-danger)", cursor: "pointer" }}>Remove</button></div>
              </form>
            </details>)}
          </div>
          {error && users.length === 0 && <ErrorState message={error} onRetry={load} />}
        </section>
      </div>
    </AdminShell>
  );
}
