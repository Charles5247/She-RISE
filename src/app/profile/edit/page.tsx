"use client";

// Screen 20 - Edit profile. Avatar, state/LGA, and profile fields.
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, FormField, PButton, ProfilePhotoPicker } from "@/components";
import { LoadingState, ErrorState } from "@/components/States";
import { getJson, patchJson } from "@/lib/apiClient";
import { findStateForLga, NIGERIA_STATES } from "@/lib/nigeria-locations";

interface Profile {
  firstName: string;
  lastName: string | null;
  bio: string | null;
  lga: string | null;
  avatarUrl: string | null;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [stateName, setStateName] = useState("");
  const [lga, setLga] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedState = useMemo(() => NIGERIA_STATES.find((state) => state.name === stateName), [stateName]);

  const load = useCallback(async () => {
    setError(null);
    const res = await getJson<{ profile: Profile }>("/api/me/profile");
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }

    const profile = res.data.profile;
    const matchingState = findStateForLga(profile.lga);
    setFirstName(profile.firstName);
    setLastName(profile.lastName || "");
    setBio(profile.bio || "");
    setStateName(matchingState?.name || "");
    setLga(profile.lga || "");
    setAvatarUrl(profile.avatarUrl);
    setLoaded(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount; load() sets state asynchronously after awaiting the API.
    load();
  }, [load]);

  async function save() {
    if (!firstName.trim()) {
      setError("Enter your first name.");
      return;
    }
    if (!stateName || !lga) {
      setError("Select your state and Local Government Area.");
      return;
    }

    setSaving(true);
    setError(null);
    const res = await patchJson("/api/me/profile", { firstName: firstName.trim(), lastName, bio, lga, avatarUrl });
    setSaving(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    router.push("/profile");
  }

  if (error && !loaded) return <ErrorState message={error} onRetry={load} />;
  if (!loaded) return <LoadingState label="Loading profile..." />;

  return (
    <main style={{ minHeight: "100vh", background: "var(--c-off)", paddingBottom: 40 }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 16px",
          borderBottom: "1px solid var(--c-line)",
        }}
      >
        <button onClick={() => router.back()} aria-label="Back" style={{ color: "var(--c-ink)", width: 44, height: 44 }}>
          <ChevronLeftIcon size={22} />
        </button>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16 }}>Edit profile</div>
      </header>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <ProfilePhotoPicker name={firstName || "You"} value={avatarUrl} onChange={setAvatarUrl} />
        <FormField label="First name (public)" value={firstName} onChange={setFirstName} required />
        <FormField label="Family name (private)" value={lastName} onChange={setLastName} />
        <FormField label="Bio" value={bio} onChange={setBio} multiline rows={3} maxLength={160} />
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
        <PButton label={saving ? "Saving..." : "Save changes"} onClick={save} disabled={saving} />
      </div>
    </main>
  );
}
