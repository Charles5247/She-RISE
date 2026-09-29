"use client";
import { T } from "@/i18n/LanguageProvider";
// Screen 10 — Feed composer + amplify. Milestone tag chip row, cross-post
// toggles (OFF by default per Design Principle 02). Copy is generated
// server-side (POST /api/posts) and blocked if it references program
// history — we surface that error verbatim if it happens.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, Chip, FormField, PButton } from "@/components";
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
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16 }}><T text={"New post"} /></div>
        <div style={{ marginLeft: "auto", width: 84 }}>
          <PButton label={loading ? "Posting…" : "Post"} onClick={submit} disabled={loading} size="sm" />
        </div>
      </header>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <FormField value={text} onChange={setText} placeholder="Share your win, in your own words…" multiline rows={5} maxLength={500} autoFocus />

        <div>
          <div className="sr-label" style={{ fontSize: 10, color: "var(--c-ink-soft)", marginBottom: 8 }}><T text={"Tag a milestone"} />{" "}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {MILESTONES.map((m) => (
              <Chip key={m.code} label={m.label} on={milestoneType === m.code} tone="var(--c-gold-deep)" onClick={() => setMilestoneType(m.code)} />
            ))}
          </div>
        </div>

        {milestoneType === "first_income" && (
          <FormField label="Amount (₦, optional)" value={amount} onChange={setAmount} type="number" placeholder="5000" />
        )}

        <p><T text={"Posts stay inside the SheRISE community."} /></p>

        {error && (
          <p className="text-xs" style={{ color: "var(--c-danger)" }}>
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
