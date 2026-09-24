"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, FormField, PButton } from "@/components";
import { postJson } from "@/lib/apiClient";

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
    const result = await postJson<{ devOtp?: string }>("/api/auth/signup", {
      identifier,
      password,
      acceptedTerms: accepted,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    sessionStorage.setItem("sherise_pending_identifier", identifier);
    if (result.data?.devOtp) sessionStorage.setItem("sherise_dev_otp", result.data.devOtp);
    router.push("/verify");
  }

  return (
    <AuthShell title="Join the movement" subtitle="Your name, your pace, your rise." onBack={() => router.push("/welcome")}>
      <form onSubmit={submit} className="sr-auth-form" aria-busy={loading}>
        <FormField label="Phone or email" value={identifier} onChange={setIdentifier} placeholder="Phone number or email address" autoComplete="username" required />
        <FormField label="Password" type="password" value={password} onChange={setPassword} placeholder="Create a password" autoComplete="new-password" required />
        <label style={{ display: "flex", gap: 10, minHeight: 44, fontSize: 14, lineHeight: 1.5, color: "var(--c-ink-soft)", cursor: "pointer" }}>
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} required style={{ marginTop: 3, width: 20, height: 20, flexShrink: 0, accentColor: "var(--c-magenta)" }} />
          I agree to the Terms &amp; the privacy commitments of SheRISE.
        </label>
        {error && <p role="alert" style={{ fontSize: 14, color: "var(--c-danger)" }}>{error}</p>}
        <PButton type="submit" size="lg" disabled={loading || !accepted} label={loading ? "Creating account..." : "Create account"} />
        <p style={{ textAlign: "center", fontSize: 14 }}>Already with us? <Link href="/login" className="sr-auth-link">Log in</Link></p>
      </form>
    </AuthShell>
  );
}
