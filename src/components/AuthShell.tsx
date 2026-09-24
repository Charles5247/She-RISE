"use client";
// AuthShell — participant auth-page shell (screens 01-08, "C2AuthShell" in
// the design reference): back-chevron + "SHE." wordmark header, title/
// subtitle, then children. Shared by participant sign-in and onboarding.
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "./Icon";

export interface AuthShellProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  onBack?: () => void;
  showBack?: boolean;
}

export function AuthShell({ title, subtitle, children, onBack, showBack = true }: AuthShellProps) {
  const router = useRouter();
  return (
    <main className="sr-auth-stage">
      <div className="sr-auth-panel">
        <div className="flex items-center justify-between">
          {showBack ? (
            <button
              type="button"
              aria-label="Back"
              onClick={onBack ?? (() => router.back())}
              style={{ color: "var(--c-ink-soft)", background: "var(--c-cream-deep)", borderRadius: 8, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <ChevronLeftIcon size={22} />
            </button>
          ) : (
            <div />
          )}
          <div
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.2em", fontSize: 12, fontWeight: 800, color: "var(--c-gold-deep)" }}
          >
            SHE.
          </div>
        </div>
        <h1
          style={{ marginTop: 20, fontSize: 36, lineHeight: 0.95, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--c-ink)", letterSpacing: "-0.03em" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ marginTop: 8, maxWidth: 300, fontSize: 14, lineHeight: 1.5, color: "var(--c-ink-soft)" }}>
            {subtitle}
          </p>
        )}
        <div style={{ marginTop: 20 }}>{children}</div>
      </div>
    </main>
  );
}
