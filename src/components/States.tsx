"use client";
// Shared loading/error/offline states used across participant screens
// (design-handoff "States" section: #/no-wifi, #/error). Not standalone
// routes — composed into any screen that fetches data.
import { useEffect, useState } from "react";
import { WifiOffIcon, AlertIcon } from "./Icon";
import { PButton } from "./PButton";
import { Spinner } from "./Primitives";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "64px 24px", color: "var(--c-ink-soft)" }}>
      <Spinner size={28} />
      <div style={{ fontSize: 13 }}>{label}</div>
    </div>
  );
}

export function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 14,
        padding: "48px 24px",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "rgba(180,70,59,0.12)",
          color: "var(--c-danger)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AlertIcon size={26} />
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--c-ink)" }}>
          Couldn&apos;t load this
        </div>
        <div style={{ marginTop: 4, fontSize: 13, color: "var(--c-ink-soft)", maxWidth: 280 }}>{message}</div>
        <div style={{ marginTop: 4, fontSize: 11, color: "var(--c-ink-soft)" }}>Your unsent posts and drafts stay safe on this device.</div>
      </div>
      {onRetry && (
        <div style={{ width: 160 }}>
          <PButton label="Try again" onClick={onRetry} size="sm" />
        </div>
      )}
    </div>
  );
}

// Hook: tracks navigator.onLine, used to show the offline banner per
// Design Principle 03 (offline-first, low-data).
export function useOnlineStatus() {
  const [online, setOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));
  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);
  return online;
}

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        background: "var(--c-plum)",
        color: "var(--c-dark-text)",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      <WifiOffIcon size={16} />
      You&apos;re offline. Showing downloaded lessons and cached content only.
    </div>
  );
}
