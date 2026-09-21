"use client";
// Screen 05 — Create profile. Name, LGA, avatar (camera-overlay avatar
// picker is stubbed to initials since real photo upload is out of scope for
// this pass — see BUILD_STATUS.md "Photography commission" open item).
// First name is public; last name stays private per Design Principle 01.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, Avatar, FormField, PButton } from "@/components";
import { postJson } from "@/lib/apiClient";
import { ALL_LGAS } from "@/lib/nigeria-locations";

export default function CreateProfilePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [lga, setLga] = useState(ALL_LGAS[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim()) {
      setError("Enter your first name.");
      return;
    }
    setError(null);
    setLoading(true);
    const result = await postJson("/api/auth/complete-profile", {
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      age: age ? Number(age) : undefined,
      lga,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.push("/onboarding/preferences");
  }

  return (
    <AuthShell title="Create your profile" subtitle="Only your first name is shown publicly. Your family name stays private.">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex justify-center py-2">
          <div style={{ position: "relative" }}>
            <Avatar name={firstName || "You"} size={84} palette="bold" />
            <div
              style={{
                position: "absolute",
                right: -2,
                bottom: -2,
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "var(--c-gold)",
                border: "2px solid #fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
              }}
            >
              📷
            </div>
          </div>
        </div>
        <FormField label="First name (public)" value={firstName} onChange={setFirstName} placeholder="Adaeze" required autoFocus />
        <FormField label="Family name (private)" value={lastName} onChange={setLastName} placeholder="Okafor" hint="Only trainers and staff can see this." />
        <FormField label="Age" value={age} onChange={setAge} type="number" placeholder="27" />
        <div>
          <div className="sr-label" style={{ fontSize: 10, color: "var(--c-ink-soft)", marginBottom: 6 }}>
            Local Government Area
          </div>
          <select
            value={lga}
            onChange={(e) => setLga(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 text-sm"
            style={{ borderColor: "var(--c-line)", color: "var(--c-ink)" }}
          >
            {ALL_LGAS.map((l, i) => (
              // Index included in the key: a handful of LGA names legitimately
              // repeat across different states (e.g. "Nasarawa", "Obi"), so the
              // name alone isn't a unique React key here.
              <option key={`${l}-${i}`} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="text-xs" style={{ color: "var(--c-danger)" }}>
            {error}
          </p>
        )}
        <PButton type="submit" label={loading ? "Saving…" : "Continue"} disabled={loading} />
      </form>
    </AuthShell>
  );
}
