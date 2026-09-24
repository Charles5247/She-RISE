"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionUser } from "@/lib/useSessionUser";
import { getJson, postJson } from "@/lib/apiClient";
import { LoadingState } from "@/components/States";

interface SponsorDashboard { womenSponsored: number; sinceYear: number | null; participants: number; courses: number }

export default function SponsorDashboardPage() {
  const router = useRouter();
  const { user, loading } = useSessionUser({ loginPath: "/admin/login", expectedRole: "sponsor" });
  const [data, setData] = useState<SponsorDashboard | null>(null);
  useEffect(() => {
    if (!user) return;
    getJson<SponsorDashboard>("/api/sponsor/dashboard").then((result) => { if (result.ok) setData(result.data); });
  }, [user]);

  async function logout() {
    await postJson("/api/auth/logout");
    router.replace("/admin/login");
  }

  if (loading || !user) return <LoadingState label="Loading sponsor portal…" />;
  return (
    <main style={{ minHeight: "100vh", background: "#f6f2e9", padding: 24, color: "#183c3d" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 980, margin: "0 auto 36px" }}>
        <div><div style={{ fontWeight: 800, fontSize: 22 }}>SheRISE · Sponsor portal</div><div style={{ fontSize: 13, opacity: .7 }}>Welcome, {user.first_name}</div></div>
        <button onClick={logout} style={{ padding: "9px 14px", border: "1px solid #ddd", borderRadius: 6, background: "white", cursor: "pointer" }}>Log out</button>
      </header>
      <section style={{ maxWidth: 980, margin: "auto" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>Your impact</h1>
        <p style={{ marginTop: 8, opacity: .7 }}>{data?.sinceYear ? `Partner since ${data.sinceYear}` : "Sponsor account"}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginTop: 24 }}>
          {[{ title: "Women sponsored", value: data?.womenSponsored ?? "—" }, { title: "Participants in the programme", value: data?.participants ?? "—" }, { title: "Courses available", value: data?.courses ?? "—" }].map((card) => <article key={card.title} style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 4px 18px #183c3d0c" }}><div style={{ fontSize: 13, opacity: .65 }}>{card.title}</div><div style={{ fontSize: 36, fontWeight: 800, marginTop: 8 }}>{card.value}</div></article>)}
        </div>
        <p style={{ marginTop: 24, padding: 18, borderRadius: 10, background: "#fff", lineHeight: 1.6 }}>This sponsor portal shows programme impact summaries. Contact an administrator for sponsorship or account changes.</p>
      </section>
    </main>
  );
}
