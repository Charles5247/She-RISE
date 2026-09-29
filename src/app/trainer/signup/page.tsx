"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell, FormField, PButton } from "@/components";
import { postJson } from "@/lib/apiClient";

export default function TrainerSignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError("");
    const result = await postJson("/api/trainer/signup", { name, email, specialty, password, acceptedTerms });
    setBusy(false);
    if (!result.ok) { setError(result.message); return; }
    router.replace("/trainer/dashboard");
  }
  return <AuthShell title="Teach. Inspire. Build futures." subtitle="Create your trainer account and prepare your course materials." onBack={() => router.push("/trainer/login")}>
    <form className="sr-auth-form" onSubmit={submit} aria-busy={busy}>
      <FormField label="Your name" value={name} onChange={setName} autoComplete="name" required />
      <FormField label="Email address" type="email" value={email} onChange={setEmail} autoComplete="email" required />
      <FormField label="Teaching specialty" value={specialty} onChange={setSpecialty} placeholder="e.g. Digital skills or tailoring" required />
      <FormField label="Password (at least 8 characters)" type="password" value={password} onChange={setPassword} autoComplete="new-password" required />
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} required />I agree to the terms and privacy commitments of SheRISE.</label>
      <p className="text-sm">You can upload materials immediately. An administrator will manage your trainer verification and participant assignments.</p>
      {error && <p role="alert" className="sr-portal-error">{error}</p>}
      <PButton type="submit" label={busy ? "Creating account..." : "Create trainer account"} disabled={busy || !acceptedTerms} />
      <p className="text-sm text-center">Already registered? <Link className="sr-auth-link" href="/trainer/login">Sign in</Link></p>
    </form>
  </AuthShell>;
}
