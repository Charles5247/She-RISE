"use client";
// AuthShell — participant auth-page shell (screens 01-08, "C2AuthShell" in
// the design reference): back-chevron + "SHE." wordmark header, title/
// subtitle, then children. `/signup` and `/login` predate this component
// (built by hand in Item 1) and are intentionally left as-is; every new
// onboarding/auth screen (verify, forgot-password, create-profile, etc.)
// should use this for consistency.
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
    <main className="min-h-screen flex items-center justify-center px-6 py-10" style={{ background: "var(--c-off)" }}>
      <div className="w-full max-w-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          {showBack ? (
            <button
              type="button"
              aria-label="Back"
              onClick={onBack ?? (() => router.back())}
              style={{ color: "var(--c-ink-soft)", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", marginLeft: -12 }}
            >
              <ChevronLeftIcon size={22} />
            </button>
          ) : (
            <div />
          )}
          <div
            className="sr-label"
            style={{ fontSize: 12, fontWeight: 800, color: "var(--c-gold-deep)" }}
          >
            SHE.
          </div>
        </div>
        <h1
          className="text-3xl font-extrabold"
          style={{ fontFamily: "var(--font-display)", color: "var(--c-ink)", letterSpacing: "-0.03em" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm -mt-2" style={{ color: "var(--c-ink-soft)" }}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </main>
  );
}
