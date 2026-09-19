"use client";
// Screen 08 — Forgot password. Identifier input + safety reassurance card
// (per Design Principle 02: this flow never mentions program history).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, FormField, PButton } from "@/components";
import { postJson } from "@/lib/apiClient";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await postJson<{ devOtp?: string }>("/api/auth/forgot-password", { identifier });
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    sessionStorage.setItem("sherise_pending_identifier", identifier);
    if (result.data?.devOtp) sessionStorage.setItem("sherise_dev_otp", result.data.devOtp);
    setSent(true);
  }

  if (sent) {
    return (
      <AuthShell title="Check your messages" subtitle="If an account exists, a reset code is on its way.">
        <div className="flex flex-col gap-4">
          <div
            className="rounded-lg p-3 text-xs leading-relaxed"
            style={{ background: "var(--c-plum)", color: "var(--c-dark-text)" }}
          >
            For your safety, we never confirm whether an account exists. If
            one does, a 6-digit code was just sent to <b>{identifier}</b>.
          </div>
          <PButton label="Enter code" onClick={() => router.push("/verify?purpose=reset")} />
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Forgot password?" subtitle="Enter your phone or email and we'll send a reset code.">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <FormField value={identifier} onChange={setIdentifier} placeholder="Phone or email" required autoComplete="username" />
        {error && (
          <p className="text-xs" style={{ color: "var(--c-danger)" }}>
            {error}
          </p>
        )}
        <PButton type="submit" label={loading ? "Sending…" : "Send reset code"} disabled={loading} />
        <div
          className="rounded-lg p-3 flex items-start gap-3 text-[11px] leading-relaxed"
          style={{ border: "1px solid var(--c-line)", color: "var(--c-ink-soft)" }}
        >
          Your account and history stay private. We&apos;ll never ask why you
          need a reset.
        </div>
      </form>
    </AuthShell>
  );
}
