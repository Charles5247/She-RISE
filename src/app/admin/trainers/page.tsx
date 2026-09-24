"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { PortalCard, ParticipantIdentity } from "@/components/StaffPortal";
import { PButton } from "@/components/PButton";
import { LoadingState, ErrorState } from "@/components/States";
import { useSessionUser } from "@/lib/useSessionUser";
import { deleteJson, getJson, patchJson, postJson } from "@/lib/apiClient";
type Role = "trainer" | "sponsor";
interface Account {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  participant_count: number;
  specialty?: string;
  rating?: number;
  notes_written?: number;
  sponsor_since_year?: number;
}
interface Participant {
  id: string;
  first_name: string;
  lga: string | null;
  skill_category: string | null;
}
interface Data {
  trainers: Account[];
  sponsors: Account[];
  participants: Participant[];
}
function AccountForm({
  role,
  account,
  onSaved,
  onCancel,
}: {
  role: Role;
  account?: Account;
  onSaved: () => Promise<void>;
  onCancel: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const r = account
      ? await patchJson(
          "/api/admin/users?id=" + encodeURIComponent(account.id),
          body,
        )
      : await postJson("/api/admin/users", { ...body, role });
    if (r.ok) {
      await onSaved();
      onCancel();
    } else setError(r.message);
    setBusy(false);
  }
  return (
    <form className="sr-portal-form" onSubmit={save}>
      <h2>
        {account ? "Edit" : "Create"} {role}
      </h2>
      <label>
        First name
        <input name="firstName" required defaultValue={account?.first_name} />
      </label>
      <label>
        Last name
        <input name="lastName" defaultValue={account?.last_name ?? ""} />
      </label>
      <label>
        Email
        <input name="email" type="email" defaultValue={account?.email ?? ""} />
      </label>
      <label>
        Phone
        <input name="phone" defaultValue={account?.phone ?? ""} />
      </label>
      <p>Provide an email address or phone number for sign-in.</p>
      {!account && role === "trainer" && (
        <label>
          Specialty
          <input name="specialty" />
        </label>
      )}
      <label>
        {account
          ? "New password (leave blank to keep current)"
          : "Temporary password"}
        <input
          name="password"
          type="password"
          minLength={8}
          required={!account}
          autoComplete="new-password"
        />
      </label>
      {error && (
        <p role="alert" className="sr-portal-error">
          {error}
        </p>
      )}
      <div className="sr-portal-actions">
        <PButton
          label={busy ? "Saving..." : "Save account"}
          type="submit"
          disabled={busy}
          full={false}
        />
        <PButton
          label="Cancel"
          variant="ghost"
          onClick={onCancel}
          disabled={busy}
          full={false}
        />
      </div>
    </form>
  );
}
function Assignments({
  role,
  account,
  options,
  onChanged,
}: {
  role: Role;
  account: Account;
  options: Participant[];
  onChanged: () => Promise<void>;
}) {
  const [participants, setParticipants] = useState<Participant[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const url =
    "/api/admin/" +
    (role === "trainer" ? "trainers/" : "sponsors/") +
    encodeURIComponent(account.id) +
    (role === "trainer" ? "/assignments" : "/sponsorships");
  const load = useCallback(async () => {
    const r = await getJson<{
      participants: Participant[];
    }>(url);
    if (r.ok && r.data) {
      setParticipants(r.data.participants);
      setError("");
    } else setError(r.message);
  }, [url]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- State updates follow the remote request.
    void load();
  }, [load]);
  async function change(id: string, remove = false) {
    setBusy(true);
    setError("");
    const r = remove
      ? await deleteJson(url + "?participantId=" + encodeURIComponent(id))
      : await postJson(url, { participantId: id });
    if (r.ok) {
      await load();
      await onChanged();
    } else setError(r.message);
    setBusy(false);
  }
  const available = options.filter(
    (p) => !participants?.some((a) => a.id === p.id),
  );
  return (
    <section>
      <h3>
        {role === "trainer" ? "Assigned participants" : "Active sponsorships"}
      </h3>
      {error && <ErrorState message={error} onRetry={load} />}{" "}
      {!participants && !error && (
        <LoadingState label="Loading assignments..." />
      )}
      {participants && (
        <>
          {participants.length === 0 && <p>No active participants.</p>}
          {participants.map((p) => (
            <div className="sr-portal-row" key={p.id}>
              <ParticipantIdentity
                name={p.first_name}
                detail={[p.lga, p.skill_category].filter(Boolean).join(" / ")}
              />
              <div className="sr-portal-actions">
                <PButton
                  label={"Remove " + p.first_name}
                  variant="ghost"
                  full={false}
                  disabled={busy}
                  onClick={() => change(p.id, true)}
                />
              </div>
            </div>
          ))}
          <form
            className="sr-portal-form"
            onSubmit={(e) => {
              e.preventDefault();
              void change(
                String(new FormData(e.currentTarget).get("participantId")),
              );
            }}
          >
            <label>
              Add participant
              <select
                name="participantId"
                required
                defaultValue=""
                disabled={busy || !available.length}
              >
                <option value="" disabled>
                  Select a participant
                </option>
                {available.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} / {p.lga ?? "LGA not set"} /{" "}
                    {p.skill_category ?? "Skill not set"} / {p.id}
                  </option>
                ))}
              </select>
            </label>
            <PButton
              type="submit"
              label={busy ? "Saving..." : "Add participant"}
              disabled={busy || !available.length}
              full={false}
            />
          </form>
        </>
      )}
    </section>
  );
}
export default function AdminTrainersPage() {
  const { user, loading } = useSessionUser({
    loginPath: "/admin/login",
    expectedRole: "admin",
  });
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<{
    role: Role;
    account?: Account;
  } | null>(null);
  const [selected, setSelected] = useState<{
    role: Role;
    account: Account;
  } | null>(null);
  const load = useCallback(async () => {
    const r = await getJson<Data>("/api/admin/trainers");
    if (r.ok && r.data) {
      setData(r.data);
      setError("");
    } else setError(r.message);
  }, []);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- State updates follow the remote request.
      void load();
    }
  }, [user, load]);
  async function remove(a: Account) {
    if (
      !window.confirm(
        "Remove " +
          a.first_name +
          " and their account data? This cannot be undone.",
      )
    )
      return;
    setBusy(true);
    const r = await deleteJson(
      "/api/admin/users?id=" + encodeURIComponent(a.id),
    );
    if (r.ok) {
      if (selected?.account.id === a.id) setSelected(null);
      if (form?.account?.id === a.id) setForm(null);
      setNotice("Account removed.");
      await load();
    } else setError(r.message);
    setBusy(false);
  }
  if (loading || !user) return <LoadingState label="Loading..." />;
  return (
    <AdminShell
      activeNav="trainers"
      title="Trainers & sponsors"
      userName={user.first_name}
    >
      {error && <ErrorState message={error} onRetry={load} />}{" "}
      {notice && <p role="status">{notice}</p>}
      {!data && !error && <LoadingState label="Loading accounts..." />}
      <div className="sr-portal-actions">
        <PButton
          label="Create trainer"
          full={false}
          onClick={() => setForm({ role: "trainer" })}
        />
        <PButton
          label="Create sponsor"
          full={false}
          onClick={() => setForm({ role: "sponsor" })}
        />
      </div>
      {form && (
        <PortalCard>
          <AccountForm
            key={form.account?.id ?? form.role}
            {...form}
            onCancel={() => setForm(null)}
            onSaved={async () => {
              setNotice(
                "Account saved. Share any temporary password securely.",
              );
              await load();
            }}
          />
        </PortalCard>
      )}
      <div className="sr-portal-grid">
        {data &&
          (["trainer", "sponsor"] as const).map((role) => (
            <PortalCard key={role}>
              <h2>{role === "trainer" ? "Trainers" : "Sponsors"}</h2>
              {data[role === "trainer" ? "trainers" : "sponsors"].length ===
                0 && <p>No {role} accounts yet.</p>}
              {data[role === "trainer" ? "trainers" : "sponsors"].map((a) => (
                <article key={a.id} className="sr-portal-row">
                  <ParticipantIdentity
                    name={[a.first_name, a.last_name].filter(Boolean).join(" ")}
                    detail={
                      role === "trainer"
                        ? [
                            a.specialty,
                            a.rating
                              ? Number(a.rating).toFixed(1) + " rating"
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" / ")
                        : a.sponsor_since_year
                          ? "Sponsor since " + a.sponsor_since_year
                          : "Sponsor"
                    }
                  />
                  <p>
                    {a.participant_count} active participants
                    {role === "trainer"
                      ? " / " + a.notes_written + " notes"
                      : ""}
                  </p>
                  <div className="sr-portal-actions">
                    <PButton
                      label="Manage participants"
                      full={false}
                      onClick={() => setSelected({ role, account: a })}
                    />
                    <PButton
                      label="Edit"
                      variant="ghost"
                      full={false}
                      onClick={() => setForm({ role, account: a })}
                    />
                    <PButton
                      label="Remove account"
                      variant="ghost"
                      full={false}
                      disabled={busy}
                      onClick={() => remove(a)}
                    />
                  </div>
                </article>
              ))}
            </PortalCard>
          ))}
      </div>
      {selected && data && (
        <PortalCard>
          <h2>Participants / {selected.account.first_name}</h2>
          <Assignments
            key={selected.account.id}
            {...selected}
            options={data.participants}
            onChanged={load}
          />
          <div className="sr-portal-actions">
            <PButton
              label="Close participants"
              variant="ghost"
              full={false}
              onClick={() => setSelected(null)}
            />
          </div>
        </PortalCard>
      )}
    </AdminShell>
  );
}
