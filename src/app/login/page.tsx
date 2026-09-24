"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell, FormField, PButton } from "@/components";
import { postJson } from "@/lib/apiClient";

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
    <AuthShell title="Welcome back" subtitle="Log in to your movement." onBack={() => router.push("/welcome")}>
      <form onSubmit={submit} className="sr-auth-form" aria-busy={loading}>
        <FormField label="Phone or email" value={identifier} onChange={setIdentifier} placeholder="Phone or email" autoComplete="username" required />
        <FormField label="Password" type="password" value={password} onChange={setPassword} placeholder="Your password" autoComplete="current-password" required />
        <Link href="/forgot-password" className="sr-auth-link" style={{ alignSelf: "flex-end" }}>Forgot password?</Link>
        {error && <p role="alert" style={{ fontSize: 14, color: "var(--c-danger)" }}>{error}</p>}
        <PButton type="submit" size="lg" disabled={loading} label={loading ? "Logging in..." : "Log in"} />
        <p style={{ textAlign: "center", fontSize: 14 }}>New here? <Link href="/signup" className="sr-auth-link">Create account</Link></p>
      </form>
      <p className="sr-staff-signin"><Link href="/admin/login">Staff sign in</Link></p>
    </AuthShell>
  );
}
