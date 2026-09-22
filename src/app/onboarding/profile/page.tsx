"use client";

// Screen 05 - Create profile. Name, state/LGA, and profile photo.
// First name is public; last name stays private per Design Principle 01.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, FormField, PButton, ProfilePhotoPicker } from "@/components";
import { postJson } from "@/lib/apiClient";
import { NIGERIA_STATES } from "@/lib/nigeria-locations";

export default function CreateProfilePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [stateName, setStateName] = useState("");
  const [lga, setLga] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedState = useMemo(() => NIGERIA_STATES.find((state) => state.name === stateName), [stateName]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim()) {
      setError("Enter your first name.");
      return;
    }
    if (!stateName || !lga) {
      setError("Select your state and Local Government Area.");
      return;
    }

    setError(null);
    setLoading(true);
    const result = await postJson("/api/auth/complete-profile", {
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      age: age ? Number(age) : undefined,
      lga,
      avatarUrl,
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
        <ProfilePhotoPicker name={firstName || "You"} value={avatarUrl} onChange={setAvatarUrl} />
        <FormField label="First name (public)" value={firstName} onChange={setFirstName} placeholder="Adaeze" required autoFocus />
        <FormField label="Family name (private)" value={lastName} onChange={setLastName} placeholder="Okafor" hint="Only trainers and staff can see this." />
        <FormField label="Age" value={age} onChange={setAge} type="number" placeholder="27" />
        <div>
          <div className="sr-label" style={{ fontSize: 10, color: "var(--c-ink-soft)", marginBottom: 6 }}>
            State
          </div>
          <select
            value={stateName}
            onChange={(e) => {
              const nextState = e.target.value;
              const firstLga = NIGERIA_STATES.find((state) => state.name === nextState)?.lgas[0] ?? "";
              setStateName(nextState);
              setLga(firstLga);
            }}
            className="w-full rounded-lg border px-4 py-3 text-sm"
            style={{ borderColor: "var(--c-line)", color: "var(--c-ink)" }}
            required
          >
            <option value="">Select state</option>
            {NIGERIA_STATES.map((state) => (
              <option key={state.name} value={state.name}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="sr-label" style={{ fontSize: 10, color: "var(--c-ink-soft)", marginBottom: 6 }}>
            Local Government Area
          </div>
          <select
            value={lga}
            onChange={(e) => setLga(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 text-sm"
            style={{ borderColor: "var(--c-line)", color: "var(--c-ink)" }}
            disabled={!selectedState}
            required
          >
            <option value="">{selectedState ? "Select LGA" : "Select a state first"}</option>
            {selectedState?.lgas.map((localGovernment) => (
              <option key={`${selectedState.name}-${localGovernment}`} value={localGovernment}>
                {localGovernment}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="text-xs" style={{ color: "var(--c-danger)" }}>
            {error}
          </p>
        )}
        <PButton type="submit" label={loading ? "Saving..." : "Continue"} disabled={loading} />
      </form>
    </AuthShell>
  );
}
