"use client";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/apiClient";
import { PButton } from "./PButton";
import { Avatar } from "./Avatar";
export function PortalCard({ children }: { children: ReactNode }) {
  return <section className="sr-portal-card">{children}</section>;
}
export function ParticipantIdentity({
  name,
  detail,
}: {
  name: string;
  detail: string;
}) {
  return (
    <div className="sr-portal-identity">
      <Avatar name={name} size={44} ring="var(--c-gold)" />
      <div>
        <h3>{name}</h3>
        <p>{detail}</p>
      </div>
    </div>
  );
}
export function StaffPortal({
  role,
  name,
  title,
  subtitle,
  children,
}: {
  role: string;
  name: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  return (
    <main className="sr-portal">
      <header className="sr-portal-header">
        <div className="sr-portal-header-copy">
          <strong>
            SheRISE<span> / {role} portal</span>
          </strong>
          <p>Welcome, {name}</p>
        </div>
        <PButton
          className="sr-portal-logout"
          label={loggingOut ? "Logging out..." : "Log out"}
          disabled={loggingOut}
          full={false}
          variant="secondary"
          onClick={async () => {
            setLoggingOut(true);
            setLogoutError("");
            const r = await postJson("/api/auth/logout");
            if (r.ok) router.replace("/admin/login");
            else setLogoutError(r.message);
            setLoggingOut(false);
          }}
        />
      </header>
      <div className="sr-portal-content">
        {logoutError && (
          <p className="sr-portal-error" role="alert">
            {logoutError}
          </p>
        )}
        <div className="sr-portal-heading">
          <p className="sr-label">EVERY RISE, ON RECORD</p>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {children}
      </div>
    </main>
  );
}
export function PortalStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <PortalCard>
      <p>{label}</p>
      <div className="sr-portal-stat">{value}</div>
    </PortalCard>
  );
}
