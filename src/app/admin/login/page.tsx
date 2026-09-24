"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/apiClient";

// Screen 24 — Admin login. Split screen per design handoff: plum left half
// with "Every rise, on record" hero + "All access is audited" line, form on
// cream right half. Posts to the existing /api/admin/login (PR #1).
export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await postJson<{ role?: string }>("/api/admin/login", {
      identifier,
      password,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    const destination =
      result.data?.role === "trainer"
        ? "/trainer/dashboard"
        : result.data?.role === "sponsor"
          ? "/sponsor/dashboard"
          : "/admin/overview";
    router.push(destination);
  }

  return (
    <main
      className="sr-admin-login min-h-screen grid"
      style={{ gridTemplateColumns: "1fr 1fr" }}
    >
      {/* Left — plum hero half */}
      <div
        className="hidden md:flex flex-col justify-between p-16 relative overflow-hidden"
        style={{ background: "var(--c-plum)", color: "var(--c-dark-text)" }}
      >
        <div
          className="absolute rounded-full"
          style={{
            bottom: -100,
            left: -100,
            width: 400,
            height: 400,
            background:
              "radial-gradient(circle, var(--c-magenta), transparent 70%)",
            opacity: 0.4,
          }}
        />
        <div className="relative flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center font-extrabold text-xl"
            style={{
              background: "var(--c-gold)",
              color: "var(--c-plum)",
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.05em",
            }}
          >
            SR
          </div>
          <div
            className="font-extrabold text-2xl"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.02em",
            }}
          >
            SheRISE<span style={{ color: "var(--c-gold)" }}>.</span> Command
          </div>
        </div>

        <div className="relative">
          <div
            className="text-xs font-bold uppercase mb-5"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "0.2em",
              color: "var(--c-gold)",
            }}
          >
            Movement mode
          </div>
          <div
            className="font-extrabold"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 5vw, 5.5rem)",
              lineHeight: 0.9,
              letterSpacing: "-0.035em",
            }}
          >
            Every rise,
            <br />
            <span style={{ color: "var(--c-gold)" }}>on record.</span>
          </div>
          <p
            className="mt-6 max-w-sm text-base leading-relaxed"
            style={{ color: "var(--c-dark-text-soft)" }}
          >
            The window you sign into is the same window funders and committee
            see.
          </p>
        </div>

        <div
          className="relative text-[11px] font-bold uppercase"
          style={{
            fontFamily: "var(--font-display)",
            letterSpacing: "0.16em",
            color: "var(--c-gold)",
          }}
        >
          v.2026.09 · CONSENT-FIRST
        </div>
      </div>

      {/* Right — cream form half */}
      <div
        className="sr-admin-login-form-side flex items-center justify-center p-8 md:p-16"
        style={{ background: "var(--c-off)", color: "var(--c-ink)" }}
      >
        <form
          onSubmit={submit}
          className="w-full max-w-md p-9 rounded-lg"
          style={{ background: "#fff", border: "2px solid var(--c-gold)" }}
        >
          <h1
            className="font-extrabold text-3xl"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.03em",
            }}
          >
            Sign in
          </h1>
          <div
            className="mt-1 text-xs font-bold uppercase"
            style={{
              color: "var(--c-ink-soft)",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.04em",
            }}
          >
            Trainer · sponsor · staff
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <input
              className="border rounded-lg px-4 py-3 text-sm"
              style={{ borderColor: "var(--c-line)" }}
              placeholder="Work email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              required
            />
            <input
              type="password"
              className="border rounded-lg px-4 py-3 text-sm"
              style={{ borderColor: "var(--c-line)" }}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="mt-3 text-xs" style={{ color: "var(--c-danger)" }}>
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="mt-4 w-full rounded-lg py-3 font-bold text-xs uppercase tracking-wider text-white"
            style={{
              background: "var(--c-magenta)",
              fontFamily: "var(--font-display)",
            }}
          >
            {loading ? "Please wait…" : "Sign in"}
          </button>

          <div
            className="mt-4 rounded-md p-3 flex items-start gap-3 text-[11px] leading-relaxed"
            style={{ background: "var(--c-plum)", color: "var(--c-dark-text)" }}
          >
            <span style={{ color: "var(--c-gold)" }}>✓</span>
            <div>
              All access is <b style={{ color: "var(--c-gold)" }}>audited</b>.
              Downloads require documented purpose.
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
