"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionUser } from "@/lib/useSessionUser";
import { getJson, postJson } from "@/lib/apiClient";
import { LoadingState } from "@/components/States";

interface TrainerDashboard { specialty: string | null; rating: number | null; learners: number; notes: number }

export default function TrainerDashboardPage() {
  const router = useRouter();
  const { user, loading } = useSessionUser({ loginPath: "/admin/login", expectedRole: "trainer" });
  const [data, setData] = useState<TrainerDashboard | null>(null);
  useEffect(() => {
    if (!user) return;
    getJson<TrainerDashboard>("/api/trainer/dashboard").then((result) => { if (result.ok) setData(result.data); });
  }, [user]);

  async function logout() {
    await postJson("/api/auth/logout");
    router.replace("/admin/login");
  }

  if (loading || !user) return <LoadingState label="Loading trainer portal…" />;
  return (
    <main style={{ minHeight: "100vh", background: "#f5f1e9", padding: 24, color: "#2a0e2e" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 980, margin: "0 auto 36px" }}>
        <div><div style={{ fontWeight: 800, fontSize: 22 }}>SheRISE · Trainer portal</div><div style={{ fontSize: 13, opacity: .7 }}>Welcome, {user.first_name}</div></div>
        <button onClick={logout} style={{ padding: "9px 14px", border: "1px solid #ddd", borderRadius: 6, background: "white", cursor: "pointer" }}>Log out</button>
      </header>
      <section style={{ maxWidth: 980, margin: "auto" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>Your teaching snapshot</h1>
        <p style={{ marginTop: 8, opacity: .7 }}>{data?.specialty || "Trainer"}{data?.rating ? ` · ${Number(data.rating).toFixed(1)} rating` : ""}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginTop: 24 }}>
          {[{ title: "Learners supported", value: data?.learners ?? "—" }, { title: "Notes recorded", value: data?.notes ?? "—" }].map((card) => <article key={card.title} style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 4px 18px #2a0e2e0c" }}><div style={{ fontSize: 13, opacity: .65 }}>{card.title}</div><div style={{ fontSize: 36, fontWeight: 800, marginTop: 8 }}>{card.value}</div></article>)}
        </div>
        <p style={{ marginTop: 24, padding: 18, borderRadius: 10, background: "#fff", lineHeight: 1.6 }}>Your trainer account is separate from the administration dashboard. Contact an administrator for learner assignments or account changes.</p>
      </section>
    </main>
  );
}
