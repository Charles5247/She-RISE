"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSessionUser } from "@/lib/useSessionUser";
import { getJson, postJson, patchJson, deleteJson } from "@/lib/apiClient";
import { MATERIAL_MAX_BYTES, materialType, type CourseMaterial } from "@/lib/course-materials";
import { StaffPortal, PortalCard } from "@/components/StaffPortal";
import { LoadingState, ErrorState } from "@/components/States";
import { PButton } from "@/components/PButton";

interface Library { courses: { id: string; title: string }[]; materials: CourseMaterial[]; storageReady: boolean }
function upload(url: string, file: File, mime: string, onProgress: (n: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", mime);
    xhr.timeout = 15 * 60 * 1000;
    xhr.upload.onprogress = event => { if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100)); };
    xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed. Check your connection and try again."));
    xhr.onerror = () => reject(new Error("Upload interrupted. Check your connection and try again."));
    xhr.ontimeout = () => reject(new Error("Upload timed out. Try a smaller file or a faster connection."));
    xhr.send(file);
  });
}

export default function TrainerMaterialsPage() {
  const { user, loading } = useSessionUser({ loginPath: "/trainer/login", expectedRole: "trainer" });
  const [data, setData] = useState<Library | null>(null);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionId, setActionId] = useState("");
  const [progress, setProgress] = useState(0);
  const load = useCallback(async () => {
    const result = await getJson<Library>("/api/trainer/materials");
    if (result.ok && result.data) { setData(result.data); setLoadError(""); }
    else setLoadError(result.message);
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Load the authenticated library.
    if (user) void load();
  }, [user, load]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const file = fields.get("file");
    setError(""); setMessage("");
    if (!(file instanceof File) || !materialType(file.name) || !file.size || file.size > MATERIAL_MAX_BYTES) {
      setError("Choose an MP4, WebM, MOV, PDF, PPT, or PPTX file between 1 byte and 50 MB."); return;
    }
    setBusy(true); setProgress(0);
    try {
      const prepared = await postJson<{ id: string; uploadUrl: string; mimeType: string }>("/api/trainer/materials", {
        title: fields.get("title"), courseId: fields.get("courseId"), filename: file.name, size: file.size,
      });
      if (!prepared.ok || !prepared.data) throw new Error(prepared.message);
      await upload(prepared.data.uploadUrl, file, prepared.data.mimeType, setProgress);
      const saved = await patchJson(`/api/trainer/materials/${prepared.data.id}`);
      if (!saved.ok) throw new Error(saved.message);
      form.reset(); setMessage("Material uploaded and saved to your library.");
    } catch (err) { setError(err instanceof Error ? err.message : "Upload failed. Please try again."); }
    finally { setBusy(false); await load(); }
  }
  async function act(item: CourseMaterial, action: "download" | "delete" | "finish") {
    if (action === "delete" && !window.confirm(`Remove “${item.title}” from your library?`)) return;
    setActionId(item.id); setError(""); setMessage("");
    const url = `/api/trainer/materials/${item.id}`;
    if (action === "download") {
      const result = await getJson<{ url: string }>(url);
      if (result.ok && result.data) window.location.assign(result.data.url);
      else setError(result.message);
    } else {
      const result = action === "delete" ? await deleteJson(url) : await patchJson(url);
      if (result.ok) { setMessage(action === "delete" ? "Material removed." : "Material saved."); await load(); }
      else setError(result.message);
    }
    setActionId("");
  }
  if (loading || !user) return <LoadingState label="Loading trainer portal..." />;
  return <StaffPortal role="Trainer" name={user.first_name} title="Your course materials" subtitle="Keep videos, presentations, and PDF modules organised by course.">
    {loadError && <ErrorState message={loadError} onRetry={load} />}
    {!data && !loadError && <LoadingState label="Loading your library..." />}
    {error && <p role="alert" className="sr-portal-error">{error}</p>}
    {message && <p role="status" className="mb-4">{message}</p>}
    {data && <div className="sr-material-layout">
      <PortalCard>
        <h2>Upload a module</h2>
        <p>Your library is private to your trainer account. Uploading does not publish a lesson to participants.</p>
        {!data.storageReady && <p role="status" className="sr-portal-error">Uploads are awaiting storage setup by your administrator.</p>}
        {!data.courses.length && <p role="status">No courses are available yet. Ask an administrator to create a course.</p>}
        <form className="sr-portal-form" onSubmit={submit} aria-busy={busy}>
          <fieldset disabled={busy || !data.storageReady || !data.courses.length} className="sr-portal-form" style={{ marginTop: 0 }}>
            <label>Course<select name="courseId" defaultValue="" required><option value="" disabled>Select a course</option>{data.courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
            <label>Module title<input name="title" maxLength={150} required placeholder="e.g. Module 1: Getting started" /></label>
            <label>Material file<input name="file" type="file" accept=".mp4,.webm,.mov,.pdf,.ppt,.pptx" required aria-describedby="file-help" /></label>
            <p id="file-help">Video (MP4, WebM, MOV), PowerPoint (PPT, PPTX), or PDF. Maximum 50 MB per file.</p>
            <PButton type="submit" label={busy ? (progress === 100 ? "Saving material..." : `Uploading ${progress}%`) : "Upload material"} disabled={busy || !data.storageReady || !data.courses.length} />
          </fieldset>
          {busy && <div role="status"><progress className="sr-upload-progress" max={100} value={progress} aria-label="File upload progress" /><p>Keep this page open until the upload finishes.</p></div>}
        </form>
      </PortalCard>
      <PortalCard>
        <h2>Material library <span className="text-sm">({data.materials.filter(m => m.status === "ready").length})</span></h2>
        {!data.materials.length && <p>Your first module starts here. Select a course and upload a file to build your library.</p>}
        {data.materials.map(item => <article key={item.id} className="sr-portal-row">
          <p className="sr-label">{item.course_title}</p>
          <h3>{item.title}</h3>
          <p>{item.filename} · {(Number(item.size_bytes) / 1024 / 1024).toFixed(1)} MB</p>
          <p>{item.status === "ready" ? "Ready" : "Upload incomplete"} · {new Date(item.created_at).toLocaleDateString()}</p>
          <div className="sr-portal-actions">
            <PButton full={false} variant="secondary" label={item.status === "ready" ? "Download" : "Check upload"} disabled={!!actionId || busy || !data.storageReady} onClick={() => void act(item, item.status === "ready" ? "download" : "finish")} />
            <button type="button" className="sr-portal-link" disabled={!!actionId || busy || !data.storageReady} onClick={() => void act(item, "delete")}>Remove</button>
          </div>
        </article>)}
      </PortalCard>
    </div>}
  </StaffPortal>;
}
