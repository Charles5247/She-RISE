"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TabBar, PButton } from "@/components";
import { LoadingState, ErrorState } from "@/components/States";
import { useSessionUser } from "@/lib/useSessionUser";
import { getJson, patchJson, postJson } from "@/lib/apiClient";
import { T } from "@/i18n/LanguageProvider";
interface Settings { wifiOnlyDownloads: boolean; panicHideEnabled: boolean }
export default function SettingsPage() {
  const { user } = useSessionUser();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const result = await getJson<{ settings: Settings }>("/api/me/settings");
    if (result.ok && result.data) { setSettings(result.data.settings); setError(""); } else setError(result.message);
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Read settings after authentication.
    if (user) void load();
  }, [user, load]);
  async function update(patch: Partial<Settings>) {
    setBusy(true); setError("");
    const result = await patchJson("/api/me/settings", patch);
    setBusy(false);
    if (result.ok) setSettings(current => current ? { ...current, ...patch } : current); else setError(result.message);
  }
  if (!settings) return error ? <ErrorState message={error} onRetry={load} /> : <LoadingState />;
  return <main className="sr-simple-page">
    <header><Link href="/profile"><T text="Back" /></Link><h1><T text="Settings" /></h1></header>
    <section className="sr-portal-card"><h2><T text="Account" /></h2><Link className="sr-portal-link" href="/profile/edit"><T text="Edit profile" /></Link></section>
    <section className="sr-portal-card"><h2><T text="Data & downloads" /></h2><label className="sr-setting-row"><T text="Wifi-only downloads" /><input type="checkbox" checked={settings.wifiOnlyDownloads} disabled={busy} onChange={e => void update({ wifiOnlyDownloads: e.target.checked })} /></label></section>
    <section className="sr-portal-card"><h2><T text="Safety" /></h2><label className="sr-setting-row"><T text="Panic hide" /><input type="checkbox" checked={settings.panicHideEnabled} disabled={busy} onChange={e => void update({ panicHideEnabled: e.target.checked })} /></label><Link className="sr-portal-link" href="/help-safety"><T text="Help & safety" /></Link></section>
    {error && <p className="sr-portal-error" role="alert"><T text={error} /></p>}
    <PButton label="Log out" disabled={busy} onClick={async () => { setBusy(true); const result = await postJson("/api/auth/logout"); if (result.ok) router.replace("/login"); else { setError(result.message); setBusy(false); } }} />
    <TabBar />
  </main>;
}
