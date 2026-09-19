"use client";
// Screen 18 — Milestone detail. Plum hero card with amount + verifier,
// 3-cell stats grid, story quote.
import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, trainerBadge, ChevronLeftIcon, MedalIcon } from "@/components";
import { LoadingState, ErrorState } from "@/components/States";
import { getJson } from "@/lib/apiClient";

interface MilestoneDetail {
  id: string;
  type: string;
  amount: number | null;
  story: string | null;
  createdAt: string;
  verifier: { firstName: string; isVerifiedTrainer: boolean } | null;
}

const LABELS: Record<string, string> = {
  first_income: "First income",
  week_complete: "Week complete",
  new_skill: "New skill",
};

export default function MilestoneDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [milestone, setMilestone] = useState<MilestoneDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await getJson<{ milestone: MilestoneDetail }>(`/api/milestones/${id}`);
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    setMilestone(res.data.milestone);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount; load() sets state asynchronously after awaiting the API.
    load();
  }, [load]);

  if (error && !milestone) return <ErrorState message={error} onRetry={load} />;
  if (!milestone) return <LoadingState label="Loading milestone…" />;

  return (
    <main style={{ minHeight: "100vh", background: "var(--c-off)", paddingBottom: 32 }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 16px",
          borderBottom: "1px solid var(--c-line)",
        }}
      >
        <button onClick={() => router.back()} aria-label="Back" style={{ color: "var(--c-ink)", width: 44, height: 44 }}>
          <ChevronLeftIcon size={22} />
        </button>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16 }}>Milestone</div>
      </header>

      <div
        style={{
          margin: 16,
          borderRadius: "var(--r-xxl)",
          background: "var(--c-plum)",
          color: "var(--c-dark-text)",
          padding: 24,
          textAlign: "center",
          boxShadow: "var(--shadow-card-magenta)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 14px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--c-gold), var(--c-gold-deep))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MedalIcon size={28} style={{ color: "var(--c-plum)" }} />
        </div>
        <div className="sr-label" style={{ fontSize: 10, color: "var(--c-gold)", marginBottom: 6 }}>
          {LABELS[milestone.type] || milestone.type}
        </div>
        {milestone.amount != null && (
          <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800 }}>₦{milestone.amount.toLocaleString()}</div>
        )}
        <div style={{ fontSize: 12, color: "var(--c-dark-text-soft)", marginTop: 6 }}>
          {new Date(milestone.createdAt).toLocaleDateString()}
        </div>
      </div>

      {milestone.story && (
        <div style={{ margin: "0 16px 16px", padding: 18, background: "#fff", border: "1px solid var(--c-line)", borderRadius: "var(--r-lg)" }}>
          <div style={{ fontSize: 15, lineHeight: 1.6, fontStyle: "italic", color: "var(--c-ink)" }}>&ldquo;{milestone.story}&rdquo;</div>
        </div>
      )}

      {milestone.verifier && (
        <div style={{ margin: "0 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={milestone.verifier.firstName} size={36} ring={milestone.verifier.isVerifiedTrainer ? "var(--c-gold)" : null} badge={milestone.verifier.isVerifiedTrainer ? trainerBadge() : null} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Verified by {milestone.verifier.firstName}</div>
            {milestone.verifier.isVerifiedTrainer && <div style={{ fontSize: 11, color: "var(--c-ink-soft)" }}>Trainer · Verified</div>}
          </div>
        </div>
      )}
    </main>
  );
}
