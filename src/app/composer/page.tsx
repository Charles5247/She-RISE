"use client";
// Screen 10 — Feed composer + amplify. Milestone tag chip row, cross-post
// toggles (OFF by default per Design Principle 02). Copy is generated
// server-side (POST /api/posts) and blocked if it references program
// history — we surface that error verbatim if it happens.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, Chip, FormField, PButton, FacebookIcon, LinkedInIcon } from "@/components";
import { postJson } from "@/lib/apiClient";

const MILESTONES = [
  { code: "none", label: "No milestone" },
  { code: "first_income", label: "First income" },
  { code: "week_complete", label: "Week complete" },
  { code: "new_skill", label: "New skill" },
];

export default function ComposerPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [milestoneType, setMilestoneType] = useState("none");
  const [amount, setAmount] = useState("");
  const [crosspostFb, setCrosspostFb] = useState(false);
  const [crosspostLi, setCrosspostLi] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!text.trim()) {
      setError("Write something before posting.");
      return;
    }
    setError(null);
    setLoading(true);
    const result = await postJson<{ crosspostCopy?: string }>("/api/posts", {
      text: text.trim(),
      milestoneType,
      crosspostFb,
      crosspostLinkedin: crosspostLi,
      milestoneAmount: milestoneType === "first_income" && amount ? Number(amount) : undefined,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.push("/feed");
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--c-off)", paddingBottom: 40 }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 16px",
          borderBottom: "1px solid var(--c-line)",
          position: "sticky",
          top: 0,
          background: "var(--c-off)",
          zIndex: 10,
        }}
      >
        <button onClick={() => router.back()} aria-label="Back" style={{ color: "var(--c-ink)", width: 44, height: 44 }}>
          <ChevronLeftIcon size={22} />
        </button>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16 }}>New post</div>
        <div style={{ marginLeft: "auto", width: 84 }}>
          <PButton label={loading ? "Posting…" : "Post"} onClick={submit} disabled={loading} size="sm" />
        </div>
      </header>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <FormField value={text} onChange={setText} placeholder="Share your win, in your own words…" multiline rows={5} maxLength={500} autoFocus />

        <div>
          <div className="sr-label" style={{ fontSize: 10, color: "var(--c-ink-soft)", marginBottom: 8 }}>
            Tag a milestone
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {MILESTONES.map((m) => (
              <Chip key={m.code} label={m.label} on={milestoneType === m.code} tone="var(--c-gold-deep)" onClick={() => setMilestoneType(m.code)} />
            ))}
          </div>
        </div>

        {milestoneType === "first_income" && (
          <FormField label="Amount (₦, optional)" value={amount} onChange={setAmount} type="number" placeholder="5000" />
        )}

        <div style={{ borderTop: "1px solid var(--c-line)", paddingTop: 16 }}>
          <div className="sr-label" style={{ fontSize: 10, color: "var(--c-ink-soft)", marginBottom: 8 }}>
            Share publicly (off by default)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                border: "1px solid var(--c-line)",
                borderRadius: "var(--r-lg)",
                cursor: "pointer",
              }}
            >
              <FacebookIcon size={18} style={{ color: "var(--c-facebook)" }} />
              <span style={{ flex: 1, fontSize: 13 }}>Cross-post to Facebook</span>
              <input type="checkbox" checked={crosspostFb} onChange={(e) => setCrosspostFb(e.target.checked)} />
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                border: "1px solid var(--c-line)",
                borderRadius: "var(--r-lg)",
                cursor: "pointer",
              }}
            >
              <LinkedInIcon size={18} style={{ color: "var(--c-linkedin)" }} />
              <span style={{ flex: 1, fontSize: 13 }}>Cross-post to LinkedIn</span>
              <input type="checkbox" checked={crosspostLi} onChange={(e) => setCrosspostLi(e.target.checked)} />
            </label>
          </div>
          {(crosspostFb || crosspostLi) && (
            <p style={{ marginTop: 8, fontSize: 11, color: "var(--c-ink-soft)" }}>
              Only your milestone and your own words are shared. Your program history is never mentioned. You&apos;ll have 30 seconds to undo after posting.
            </p>
          )}
        </div>

        {error && (
          <p className="text-xs" style={{ color: "var(--c-danger)" }}>
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
