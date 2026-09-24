"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSessionUser } from "@/lib/useSessionUser";
import { getJson, postJson } from "@/lib/apiClient";
import { LoadingState, ErrorState } from "@/components/States";
import { PButton } from "@/components/PButton";
import {
  StaffPortal,
  PortalCard,
  PortalStat,
  ParticipantIdentity,
} from "@/components/StaffPortal";
interface Participant {
  id: string;
  first_name: string;
  lga: string | null;
  skill_category: string | null;
  recent_notes: {
    id: string;
    body: string;
    created_at: string;
  }[];
}
interface Data {
  specialty: string | null;
  rating: number | null;
  learners: number;
  notes: number;
  participants: Participant[];
}
function NoteForm({
  id,
  onSaved,
}: {
  id: string;
  onSaved: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setError("");
    const r = await postJson(
      "/api/admin/participants/" + encodeURIComponent(id) + "/notes",
      { body: new FormData(form).get("body") },
    );
    if (r.ok) {
      form.reset();
      await onSaved();
    } else setError(r.message);
    setBusy(false);
  }
  return (
    <form className="sr-portal-form" onSubmit={save}>
      <label>
        New participant note
        <textarea name="body" required maxLength={5000} />
      </label>
      <p>Visible to this participant and authorised staff.</p>
      {error && (
        <p role="alert" className="sr-portal-error">
          {error}
        </p>
      )}
      <PButton
        type="submit"
        label={busy ? "Saving..." : "Save note"}
        disabled={busy}
        full={false}
      />
    </form>
  );
}
export default function TrainerDashboardPage() {
  const { user, loading } = useSessionUser({
    loginPath: "/admin/login",
    expectedRole: "trainer",
  });
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    const r = await getJson<Data>("/api/trainer/dashboard");
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
  if (loading || !user)
    return <LoadingState label="Loading trainer portal..." />;
  return (
    <StaffPortal
      role="Trainer"
      name={user.first_name}
      title="Your teaching, their next chapter."
      subtitle={
        data?.specialty ??
        "Support your assigned participants, one step at a time."
      }
    >
      {error && <ErrorState message={error} onRetry={load} />}{" "}
      {!data && !error && <LoadingState label="Loading your participants..." />}
      {data && (
        <>
          <div className="sr-portal-grid">
            <PortalStat label="Assigned participants" value={data.learners} />
            <PortalStat label="Notes recorded" value={data.notes} />
          </div>
          <PortalCard>
            <h2>Your participants</h2>
            {!data.participants.length && (
              <p>
                No participants assigned yet. An administrator can add
                participants to your roster.
              </p>
            )}
            {data.participants.map((p) => (
              <article className="sr-portal-row" key={p.id}>
                <ParticipantIdentity
                  name={p.first_name}
                  detail={
                    [p.lga, p.skill_category].filter(Boolean).join(" / ") ||
                    "Learning journey"
                  }
                />
                <div className="sr-portal-actions">
                  <Link
                    className="sr-portal-link"
                    href={
                      "/trainer-chat/" +
                      encodeURIComponent(user.id) +
                      "?participantId=" +
                      encodeURIComponent(p.id)
                    }
                  >
                    Open conversation with {p.first_name}
                  </Link>
                </div>
                <h3>Recent notes</h3>
                {!p.recent_notes.length && <p>No notes recorded yet.</p>}
                {p.recent_notes.map((n) => (
                  <div className="sr-portal-note" key={n.id}>
                    <p>{n.body}</p>
                    <time dateTime={n.created_at}>
                      {new Date(n.created_at).toLocaleDateString()}
                    </time>
                  </div>
                ))}
                <NoteForm id={p.id} onSaved={load} />
              </article>
            ))}
          </PortalCard>
        </>
      )}
    </StaffPortal>
  );
}
