"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { postJson } from "@/lib/apiClient";

// Screen 07 — Login. Phone/email + password, matching the visual pattern
// established in src/app/signup/page.tsx. Redirects into the participant
// app on success; the full Feed screen (09) is still Item 3 — for now this
// sends her to /feed, a minimal placeholder landing.
export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await postJson<{ onboardingComplete?: boolean; role?: string }>("/api/auth/login", { identifier, password });
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    if (result.data?.role !== "participant") {
      setError("This account uses the staff sign-in page.");
      return;
    }
    router.push("/feed");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--c-off)" }}>
      <form onSubmit={submit} className="w-full max-w-sm flex flex-col gap-4">
        <div
          className="text-xs font-bold uppercase"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.2em", color: "var(--c-gold-deep)" }}
        >
          SHE.
        </div>
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--c-ink)", letterSpacing: "-0.03em" }}>
          Welcome back
        </h1>
        <p className="text-sm -mt-2" style={{ color: "var(--c-ink-soft)" }}>
          Log in to your movement.
        </p>
        <input
          className="border rounded-lg px-4 py-3 text-sm"
          style={{ borderColor: "var(--c-line)" }}
          placeholder="Phone or email"
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
        <Link
          href="/forgot-password"
          className="text-xs font-bold uppercase text-right"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.04em", color: "var(--c-magenta)" }}
        >
          Forgot password?
        </Link>
        {error && <p className="text-xs" style={{ color: "var(--c-danger)" }}>{error}</p>}
        <button
          disabled={loading}
          className="rounded-lg py-3 font-bold text-xs uppercase tracking-wider text-white"
          style={{ background: "var(--c-magenta)", fontFamily: "var(--font-display)" }}
        >
          {loading ? "Please wait…" : "Log in"}
        </button>
        <p className="text-xs text-center" style={{ color: "var(--c-ink-soft)" }}>
          New here?{" "}
          <Link href="/signup" className="font-bold" style={{ color: "var(--c-magenta)" }}>
            Create account
          </Link>
        </p>

      </form>
    </main>
  );
}
