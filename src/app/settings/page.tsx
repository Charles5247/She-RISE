"use client";
// Screen 21 — Settings. Grouped rows, toggles for wifi-only, panic hide
// (Design Principle 08 — always available, default ON), log-out CTA.
//
// Connected accounts (Facebook/LinkedIn) are NOT a bare toggle — per the
// project's consent-first principle, connecting requires an explicit mock
// consent step before anything is marked connected, and disconnecting
// requires confirmation. This is UI/UX only: it still writes to the same
// fbConnected/liConnected columns via PATCH /api/me/settings, and the actual
// post-time provider calls remain mocked in src/lib/crosspost.ts behind
// FEATURE_CROSSPOST_LIVE (untouched).
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon, LockIcon, FacebookIcon, LinkedInIcon, Avatar } from "@/components";
import { LoadingState, ErrorState } from "@/components/States";
import { getJson, patchJson, postJson } from "@/lib/apiClient";

interface Settings {
  language: string;
  wifiOnlyDownloads: boolean;
  panicHideEnabled: boolean;
  fbConnected: boolean;
  liConnected: boolean;
}

type ConnectedProvider = "facebook" | "linkedin";

const PROVIDER_META: Record<ConnectedProvider, { label: string; color: string; mockName: string; Icon: typeof FacebookIcon }> = {
  facebook: { label: "Facebook", color: "var(--c-facebook)", mockName: "Your Facebook profile", Icon: FacebookIcon },
  linkedin: { label: "LinkedIn", color: "var(--c-linkedin)", mockName: "Your LinkedIn profile", Icon: LinkedInIcon },
};

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

// Bottom-sheet-style overlay used for both the consent modal and the
// disconnect confirmation — kept local to this screen since it's the only
// place in the participant app that currently needs a modal.
function Overlay({ children, onDismiss }: { children: React.ReactNode; onDismiss: () => void }) {
  return (
    <div
      onClick={onDismiss}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,8,22,0.55)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "var(--c-off)",
          borderRadius: "var(--r-lg) var(--r-lg) 0 0",
          padding: "20px 20px 28px",
          boxShadow: "0 -8px 30px rgba(0,0,0,0.2)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Mock consent step shown before a Facebook/LinkedIn account is ever marked
// connected. Makes explicit that SheRISE never posts automatically — every
// post still needs her per-post approval in the composer.
function ConsentModal({
  provider,
  busy,
  onAllow,
  onCancel,
}: {
  provider: ConnectedProvider;
  busy: boolean;
  onAllow: () => void;
  onCancel: () => void;
}) {
  const meta = PROVIDER_META[provider];
  return (
    <Overlay onDismiss={onCancel}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--c-line)",
          }}
        >
          <meta.Icon size={20} style={{ color: meta.color }} />
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15 }}>Connect {meta.label}</div>
      </div>
      <p style={{ fontSize: 13, color: "var(--c-ink)", lineHeight: 1.5, marginBottom: 10 }}>
        SheRISE will be able to share a post to your {meta.label} feed — but only when you tap &quot;Post&quot;
        yourself for each one, in the composer.
      </p>
      <p style={{ fontSize: 13, color: "var(--c-ink-soft)", lineHeight: 1.5, marginBottom: 20 }}>
        Nothing is ever posted automatically or without your review. You can disconnect this account at
        any time from Settings.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onCancel}
          disabled={busy}
          className="sr-label"
          style={{
            flex: 1,
            padding: 14,
            borderRadius: "var(--r-lg)",
            background: "transparent",
            border: "1px solid var(--c-line)",
            color: "var(--c-ink)",
            fontWeight: 800,
            fontSize: 11,
          }}
        >
          Cancel
        </button>
        <button
          onClick={onAllow}
          disabled={busy}
          className="sr-label"
          style={{
            flex: 1,
            padding: 14,
            borderRadius: "var(--r-lg)",
            background: "var(--c-magenta)",
            border: "none",
            color: "#fff",
            fontWeight: 800,
            fontSize: 11,
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? "Connecting…" : "Allow"}
        </button>
      </div>
    </Overlay>
  );
}

function DisconnectConfirm({
  provider,
  busy,
  onConfirm,
  onCancel,
}: {
  provider: ConnectedProvider;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const meta = PROVIDER_META[provider];
  return (
    <Overlay onDismiss={onCancel}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, marginBottom: 8 }}>
        Disconnect {meta.label}?
      </div>
      <p style={{ fontSize: 13, color: "var(--c-ink-soft)", lineHeight: 1.5, marginBottom: 20 }}>
        SheRISE will no longer be able to post to your {meta.label} feed until you reconnect it.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onCancel}
          disabled={busy}
          className="sr-label"
          style={{
            flex: 1,
            padding: 14,
            borderRadius: "var(--r-lg)",
            background: "transparent",
            border: "1px solid var(--c-line)",
            color: "var(--c-ink)",
            fontWeight: 800,
            fontSize: 11,
          }}
        >
          Keep connected
        </button>
        <button
          onClick={onConfirm}
          disabled={busy}
          className="sr-label"
          style={{
            flex: 1,
            padding: 14,
            borderRadius: "var(--r-lg)",
            background: "#fff",
            border: "1px solid var(--c-danger)",
            color: "var(--c-danger)",
            fontWeight: 800,
            fontSize: 11,
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? "Disconnecting…" : "Disconnect"}
        </button>
      </div>
    </Overlay>
  );
}

// Connected-state card — replaces the bare toggle once an account is linked.
function ConnectedCard({ provider, onDisconnect }: { provider: ConnectedProvider; onDisconnect: () => void }) {
  const meta = PROVIDER_META[provider];
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
      <Avatar name={meta.mockName} size={36} palette="clean" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <meta.Icon size={14} style={{ color: meta.color }} />
          <div style={{ fontSize: 13, fontWeight: 600 }}>{meta.label}</div>
        </div>
        <div style={{ fontSize: 11, color: "var(--c-success)", marginTop: 2 }}>Connected · {meta.mockName}</div>
      </div>
      <button
        onClick={onDisconnect}
        className="sr-label"
        style={{
          padding: "8px 12px",
          borderRadius: "var(--r-pill)",
          background: "transparent",
          border: "1px solid var(--c-line)",
          color: "var(--c-ink-soft)",
          fontWeight: 700,
          fontSize: 10,
        }}
      >
        Disconnect
      </button>
    </div>
  );
}

// Not-yet-connected row — replaces the bare toggle's "off" state with an
// explicit Connect button that opens the consent modal.
function ConnectRow({ provider, onConnect }: { provider: ConnectedProvider; onConnect: () => void }) {
  const meta = PROVIDER_META[provider];
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
      <meta.Icon size={18} style={{ color: meta.color }} />
      <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{meta.label}</div>
      <button
        onClick={onConnect}
        className="sr-label"
        style={{
          padding: "8px 14px",
          borderRadius: "var(--r-pill)",
          background: "var(--c-cream)",
          border: "1px solid var(--c-line)",
          color: "var(--c-ink)",
          fontWeight: 800,
          fontSize: 10,
        }}
      >
        Connect
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [consentFor, setConsentFor] = useState<ConnectedProvider | null>(null);
  const [disconnectFor, setDisconnectFor] = useState<ConnectedProvider | null>(null);
  const [connectBusy, setConnectBusy] = useState(false);

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

  async function confirmConnect() {
    if (!consentFor) return;
    setConnectBusy(true);
    const patch: Partial<Settings> = consentFor === "facebook" ? { fbConnected: true } : { liConnected: true };
    await update(patch);
    setConnectBusy(false);
    setConsentFor(null);
  }

  async function confirmDisconnect() {
    if (!disconnectFor) return;
    setConnectBusy(true);
    const patch: Partial<Settings> = disconnectFor === "facebook" ? { fbConnected: false } : { liConnected: false };
    await update(patch);
    setConnectBusy(false);
    setDisconnectFor(null);
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
      {settings.fbConnected ? (
        <ConnectedCard provider="facebook" onDisconnect={() => setDisconnectFor("facebook")} />
      ) : (
        <ConnectRow provider="facebook" onConnect={() => setConsentFor("facebook")} />
      )}
      {settings.liConnected ? (
        <ConnectedCard provider="linkedin" onDisconnect={() => setDisconnectFor("linkedin")} />
      ) : (
        <ConnectRow provider="linkedin" onConnect={() => setConsentFor("linkedin")} />
      )}

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

      {consentFor && (
        <ConsentModal
          provider={consentFor}
          busy={connectBusy}
          onAllow={confirmConnect}
          onCancel={() => setConsentFor(null)}
        />
      )}
      {disconnectFor && (
        <DisconnectConfirm
          provider={disconnectFor}
          busy={connectBusy}
          onConfirm={confirmDisconnect}
          onCancel={() => setDisconnectFor(null)}
        />
      )}
    </main>
  );
}
