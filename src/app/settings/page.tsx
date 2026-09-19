"use client";
// Screen 21 — Settings. Grouped rows, toggles for wifi-only, panic hide
// (Design Principle 08 — always available, default ON), log-out CTA.
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon, LockIcon } from "@/components";
import { LoadingState, ErrorState } from "@/components/States";
import { getJson, patchJson, postJson } from "@/lib/apiClient";

interface Settings {
  language: string;
  wifiOnlyDownloads: boolean;
  panicHideEnabled: boolean;
  fbConnected: boolean;
  liConnected: boolean;
}

function ToggleRow({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        background: "#fff",
        borderBottom: "1px solid var(--c-line-soft)",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: "var(--c-ink-soft)", marginTop: 2 }}>{hint}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        aria-label={label}
        style={{
          width: 44,
          height: 26,
          borderRadius: "var(--r-pill)",
          background: checked ? "var(--c-magenta)" : "var(--c-line)",
          position: "relative",
          border: "none",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 21 : 3,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.15s ease",
          }}
        />
      </button>
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="sr-label" style={{ padding: "18px 16px 6px", fontSize: 10, color: "var(--c-ink-soft)" }}>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const res = await getJson<{ settings: Settings }>("/api/me/settings");
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    setSettings(res.data.settings);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount; load() sets state asynchronously after awaiting the API.
    load();
  }, [load]);

  async function update(patch: Partial<Settings>) {
    if (!settings) return;
    setSettings({ ...settings, ...patch });
    await patchJson("/api/me/settings", patch);
  }

  async function logout() {
    setLoggingOut(true);
    await postJson("/api/auth/logout");
    router.push("/login");
  }

  if (error && !settings) return <ErrorState message={error} onRetry={load} />;
  if (!settings) return <LoadingState label="Loading settings…" />;

  return (
    <main style={{ minHeight: "100vh", background: "var(--c-cream)", paddingBottom: 40 }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 16px",
          borderBottom: "1px solid var(--c-line)",
          background: "var(--c-off)",
        }}
      >
        <button onClick={() => router.back()} aria-label="Back" style={{ color: "var(--c-ink)", width: 44, height: 44 }}>
          <ChevronLeftIcon size={22} />
        </button>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16 }}>Settings</div>
      </header>

      <GroupLabel>Data &amp; downloads</GroupLabel>
      <ToggleRow
        label="Wi-Fi only downloads"
        hint="Save mobile data — lessons only download on Wi-Fi"
        checked={settings.wifiOnlyDownloads}
        onChange={(v) => update({ wifiOnlyDownloads: v })}
      />

      <GroupLabel>Safety</GroupLabel>
      <div style={{ background: "#fff", borderBottom: "1px solid var(--c-line-soft)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <LockIcon size={16} style={{ color: "var(--c-gold-deep)" }} />
        <div style={{ fontSize: 11, color: "var(--c-ink-soft)" }}>Long-press the home indicator anytime to hide SheRISE behind a calculator screen.</div>
      </div>
      <ToggleRow label="Panic hide" hint="Always available via long-press" checked={settings.panicHideEnabled} onChange={(v) => update({ panicHideEnabled: v })} />

      <GroupLabel>Connected accounts</GroupLabel>
      <ToggleRow label="Facebook" checked={settings.fbConnected} onChange={(v) => update({ fbConnected: v })} />
      <ToggleRow label="LinkedIn" checked={settings.liConnected} onChange={(v) => update({ liConnected: v })} />

      <GroupLabel>About</GroupLabel>
      <div
        onClick={() => router.push("/help-safety")}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#fff", borderBottom: "1px solid var(--c-line-soft)", cursor: "pointer" }}
      >
        <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>Help &amp; safety</div>
        <ChevronRightIcon size={16} style={{ color: "var(--c-ink-soft)" }} />
      </div>

      <div style={{ padding: 16 }}>
        <button
          onClick={logout}
          disabled={loggingOut}
          className="sr-label"
          style={{
            width: "100%",
            padding: 14,
            borderRadius: "var(--r-lg)",
            background: "#fff",
            border: "1px solid var(--c-danger)",
            color: "var(--c-danger)",
            fontWeight: 800,
            fontSize: 11,
          }}
        >
          {loggingOut ? "Logging out…" : "Log out"}
        </button>
      </div>
      {error && (
        <p className="text-xs text-center" style={{ color: "var(--c-danger)" }}>
          {error}
        </p>
      )}
    </main>
  );
}
