"use client";
// Reset password — final step of the forgot-password flow. The 6-digit
// code was already collected on /verify?purpose=reset and stashed in
// sessionStorage; this screen only collects the new password.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, FormField, PButton } from "@/components";
import { postJson } from "@/lib/apiClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of sessionStorage on mount (not derivable from props/render).
    setIdentifier(sessionStorage.getItem("sherise_pending_identifier") || "");
    setCode(sessionStorage.getItem("sherise_reset_code") || "");
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setError(null);
    setLoading(true);
    const result = await postJson("/api/auth/reset-password", { identifier, code, newPassword: password });
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    sessionStorage.removeItem("sherise_reset_code");
    setDone(true);
  }

  if (done) {
    return (
      <AuthShell title="Password reset" subtitle="You can log in with your new password now." showBack={false}>
        <PButton label="Go to login" onClick={() => router.push("/login")} />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose something you'll remember, but others won't guess.">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <FormField label="New password" value={password} onChange={setPassword} type="password" required autoComplete="new-password" />
        <FormField label="Confirm password" value={confirm} onChange={setConfirm} type="password" required autoComplete="new-password" />
        {error && (
          <p className="text-xs" style={{ color: "var(--c-danger)" }}>
            {error}
          </p>
        )}
        <PButton type="submit" label={loading ? "Saving…" : "Reset password"} disabled={loading} />
      </form>
    </AuthShell>
  );
}
