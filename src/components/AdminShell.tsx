"use client";
// AdminShell — top bar (logo, nav links, search, Export PDF, avatar) + title
// row, wrapping every admin desktop screen. Adapted from the design
// reference's `AdminShell` to real Next.js navigation + a working logout.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "./Avatar";
import { SearchIcon, DownloadIcon } from "./Icon";
import { postJson } from "@/lib/apiClient";
import { useState } from "react";

const NAV = [
  { k: "overview", l: "Overview", href: "/admin/overview" },
  { k: "participants", l: "Participants", href: "/admin/participants" },
  { k: "users", l: "Accounts", href: "/admin/users" },
  { k: "referrals", l: "Referrals", href: "/admin/referrals" },
  { k: "content", l: "Content", href: "/admin/content" },
  { k: "perception", l: "Perception", href: "/admin/perception" },
  { k: "reports", l: "Reports", href: "/admin/reports" },
  { k: "broadcasts", l: "Broadcasts", href: "/admin/broadcasts" },
  { k: "trainers", l: "Trainers", href: "/admin/trainers" },
] as const;

export interface AdminShellProps {
  title?: React.ReactNode;
  subtitle?: string;
  activeNav: (typeof NAV)[number]["k"];
  children: React.ReactNode;
  userName?: string;
  onExport?: () => void;
  right?: React.ReactNode;
}

export function AdminShell({
  title,
  subtitle,
  activeNav,
  children,
  userName = "Admin",
  onExport,
  right,
}: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function logout() {
    setLoggingOut(true);
    setLogoutError("");
    const result = await postJson("/api/auth/logout");
    if (!result.ok) {
      setLogoutError(result.message);
      setLoggingOut(false);
      return;
    }
    router.push("/admin/login");
  }

  return (
    <div
      className="sr-admin-shell"
      style={{
        minHeight: "100vh",
        background: "var(--c-off)",
        color: "var(--c-ink)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div
        className="sr-admin-shell-inner"
        style={{ maxWidth: 1440, margin: "0 auto", padding: "24px 40px 60px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 16,
            borderBottom: "1px solid var(--c-line)",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div
            className="sr-admin-brand-nav"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: "var(--c-gold)",
                  color: "var(--c-plum)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                  fontWeight: 800,
                }}
              >
                S
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 18,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                  }}
                >
                  SheRISE M&amp;E
                </div>
                <div
                  className="sr-label"
                  style={{ fontSize: 9, color: "var(--c-ink-soft)" }}
                >
                  {subtitle || "ADMIN · CONSENT-FIRST"}
                </div>
              </div>
            </div>
            <nav
              className="sr-admin-nav"
              style={{
                display: "flex",
                gap: 18,
                fontSize: 13,
                flexWrap: "wrap",
              }}
            >
              {NAV.map((t) => {
                const isActive =
                  t.k === activeNav || pathname?.startsWith(t.href);
                return (
                  <Link
                    key={t.k}
                    href={t.href}
                    style={{
                      padding: "4px 0",
                      color: isActive ? "var(--c-ink)" : "var(--c-ink-soft)",
                      fontWeight: isActive ? 700 : 500,
                      borderBottom: isActive
                        ? "2px solid var(--c-magenta)"
                        : "2px solid transparent",
                    }}
                  >
                    {t.l}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div
            className="sr-admin-actions"
            style={{ display: "flex", gap: 10, alignItems: "center" }}
          >
            <div
              style={{
                padding: "8px 12px",
                border: "1px solid var(--c-line)",
                borderRadius: 6,
                fontSize: 12,
                color: "var(--c-ink-soft)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <SearchIcon size={14} /> Search…
            </div>
            {onExport && (
              <button
                onClick={onExport}
                style={{
                  padding: "8px 14px",
                  borderRadius: 6,
                  background: "var(--c-magenta)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <DownloadIcon size={12} /> Export PDF
              </button>
            )}
            <button
              onClick={logout}
              disabled={loggingOut}
              aria-label="Log out"
              style={{
                border: "1px solid var(--c-line)",
                background: "#fff",
                borderRadius: 6,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 10px 5px 5px",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--c-ink)",
              }}
            >
              <Avatar name={userName} size={28} palette="clean" />
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        </div>
        {logoutError && (
          <p
            role="alert"
            style={{
              color: "var(--c-danger)",
              fontSize: 12,
              textAlign: "right",
              marginTop: 8,
            }}
          >
            {logoutError}
          </p>
        )}
        {(title || right) && (
          <div
            style={{
              padding: "20px 0 12px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            {title && (
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 26,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                {title}
              </div>
            )}
            {right}
          </div>
        )}
        <div className="sr-admin-content" style={{ marginTop: title ? 0 : 20 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
