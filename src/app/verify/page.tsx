"use client";
// Screen 04 — Verify code. 6-digit OTP input, resend timer. Continues the
// flow started by /signup (which stashes the pending identifier + dev-mode
// OTP in sessionStorage) and /forgot-password (reset flow, ?purpose=reset).
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components";
import { PButton } from "@/components";
import { postJson } from "@/lib/apiClient";

const RESEND_SECONDS = 24;

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const purpose = params.get("purpose") === "reset" ? "reset" : "signup";
  const [identifier, setIdentifier] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // One-time read of sessionStorage on mount (not derivable from props/render).
    const stored = sessionStorage.getItem("sherise_pending_identifier") || "";
    const devOtp = sessionStorage.getItem("sherise_dev_otp");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIdentifier(stored);
    if (devOtp) {
      setDigits(devOtp.padEnd(6, " ").slice(0, 6).split("").map((c) => (c === " " ? "" : c)));
    }
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function setDigit(i: number, val: string) {
    const clean = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < 5) inputsRef.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Enter all 6 digits.");
      return;
    }
    setError(null);
    setLoading(true);
    if (purpose === "reset") {
      // Reset flow hands the code to /reset-password's confirm-new-password step.
      sessionStorage.setItem("sherise_reset_code", code);
      setLoading(false);
      router.push("/reset-password");
      return;
    }
    const result = await postJson<{ onboardingComplete?: boolean }>("/api/auth/verify-otp", { identifier, code });
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.push(result.data?.onboardingComplete ? "/feed" : "/onboarding/profile");
  }

  async function resend() {
    setResending(true);
    setError(null);
    const result = await postJson<{ devOtp?: string }>("/api/auth/resend-otp", { identifier });
    setResending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setCountdown(RESEND_SECONDS);
    if (result.data?.devOtp) sessionStorage.setItem("sherise_dev_otp", result.data.devOtp);
  }

  return (
    <AuthShell title="Verify code" subtitle={`We sent a 6-digit code to ${identifier || "your phone or email"}.`}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex gap-2 justify-between">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              className="text-center text-lg font-bold rounded-lg border"
              style={{
                width: 44,
                height: 52,
                borderColor: "var(--c-line)",
                fontFamily: "var(--font-mono)",
                color: "var(--c-ink)",
              }}
            />
          ))}
        </div>
        {error && (
          <p className="text-xs" style={{ color: "var(--c-danger)" }}>
            {error}
          </p>
        )}
        <PButton type="submit" label={loading ? "Verifying…" : "Verify"} disabled={loading} />
        <button
          type="button"
          onClick={resend}
          disabled={countdown > 0 || resending}
          className="text-xs font-bold uppercase text-center"
          style={{
            fontFamily: "var(--font-display)",
            letterSpacing: "0.06em",
            color: countdown > 0 ? "var(--c-ink-soft)" : "var(--c-magenta)",
          }}
        >
          {countdown > 0 ? `Resend code in ${countdown}s` : resending ? "Sending…" : "Resend code"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}
