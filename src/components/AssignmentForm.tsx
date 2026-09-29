"use client";
import { useState, type FormEvent } from "react";
import { postJson } from "@/lib/apiClient";
import { PButton } from "./PButton";

export function AssignmentForm({ participantId, participantName }: { participantId: string; participantName: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setBusy(true); setError(""); setSent(false);
    const result = await postJson("/api/admin/learning-assignments", { participantId, title: fields.get("title"), instructions: fields.get("instructions"), dueDate: fields.get("dueDate") });
    setBusy(false);
    if (!result.ok) { setError(result.message); return; }
    form.reset(); setSent(true);
  }
  return <details className="sr-assignment-composer">
    <summary>Send an assignment to {participantName}</summary>
    <form className="sr-portal-form" onSubmit={submit} aria-busy={busy}>
      <label>Assignment title<input name="title" required maxLength={150} placeholder="e.g. Practise your first stitch" disabled={busy} /></label>
      <label>Instructions<textarea name="instructions" required maxLength={5000} placeholder="Explain the activity and what the participant should prepare." disabled={busy} /></label>
      <label>Due date (optional)<input type="date" name="dueDate" disabled={busy} /></label>
      <p>The participant will receive a notification on their dashboard.</p>
      {error && <p className="sr-portal-error" role="alert">{error}</p>}
      {sent && <p role="status">Assignment sent and notification created.</p>}
      <PButton type="submit" label={busy ? "Sending..." : "Send assignment"} disabled={busy} full={false} />
    </form>
  </details>;
}
