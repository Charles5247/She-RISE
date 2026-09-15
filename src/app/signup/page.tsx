"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Screen 03 — Sign up. Full onboarding flow (screens 01-08) is wired to the
// API routes under /api/auth/*; this is the first working screen. See
// BUILD_STATUS.md for the remaining 34 screens.
export default function SignupPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password, acceptedTerms: accepted }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message || "Something went wrong.");
      return;
    }
    sessionStorage.setItem("sherise_pending_identifier", identifier);
    if (data.devOtp) sessionStorage.setItem("sherise_dev_otp", data.devOtp);
    router.push("/verify");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--c-off)" }}>
      <form onSubmit={submit} className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--c-ink)", letterSpacing: "-0.03em" }}>
          Sign up
        </h1>
        <input
          className="border rounded-lg px-4 py-3 text-sm"
          style={{ borderColor: "var(--c-line)" }}
          placeholder="Phone or email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <input
          type="password"
          className="border rounded-lg px-4 py-3 text-sm"
          style={{ borderColor: "var(--c-line)" }}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label className="flex items-start gap-2 text-xs" style={{ color: "var(--c-ink-soft)" }}>
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5" />
          I agree to the Terms &amp; the privacy commitments of SheRISE.
        </label>
        {error && <p className="text-xs" style={{ color: "var(--c-danger)" }}>{error}</p>}
        <button
          disabled={loading}
          className="rounded-lg py-3 font-bold text-xs uppercase tracking-wider text-white"
          style={{ background: "var(--c-magenta)", fontFamily: "var(--font-display)" }}
        >
          {loading ? "Please wait…" : "Sign up"}
        </button>
      </form>
    </main>
  );
}
