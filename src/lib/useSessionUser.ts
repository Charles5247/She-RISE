"use client";
// Shared client hook for reading the logged-in user in participant/admin
// screens. Wraps GET /api/auth/me, redirects to the appropriate login page
// on 401 (participant screens -> /login; admin screens -> /admin/login).
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getJson } from "./apiClient";

export interface SessionUserView {
  id: string;
  role: "participant" | "trainer" | "admin" | "sponsor";
  first_name: string;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  language: string;
  lga: string | null;
  avatar_url: string | null;
  is_verified_trainer: number;
  panic_hide_enabled: number;
  onboarding_complete: number;
}

export function useSessionUser(opts: { loginPath?: string; expectedRole?: SessionUserView["role"] } = {}) {
  const { loginPath = "/login" } = opts;
  const expectedRole = opts.expectedRole ?? (loginPath.startsWith("/admin") ? "admin" : loginPath.startsWith("/trainer") ? "trainer" : loginPath.startsWith("/sponsor") ? "sponsor" : "participant");
  const router = useRouter();
  const [user, setUser] = useState<SessionUserView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getJson<{ user: SessionUserView }>("/api/auth/me").then((res) => {
      if (cancelled) return;
      if (!res.ok || !res.data?.user) {
        router.replace(loginPath);
        return;
      }
      if (res.data.user.role !== expectedRole) {
        const destination = res.data.user.role === "admin" ? "/admin/overview" : res.data.user.role === "trainer" ? "/trainer/dashboard" : res.data.user.role === "sponsor" ? "/sponsor/dashboard" : "/feed";
        router.replace(destination);
        return;
      }
      setUser(res.data.user);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expectedRole, loginPath, router]);

  return { user, loading };
}
