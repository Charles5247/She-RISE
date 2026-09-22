"use client";
// Screen 20 — Edit profile. Avatar w/ camera, FormField x4.
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, ChevronLeftIcon, FormField, PButton } from "@/components";
import { LoadingState, ErrorState } from "@/components/States";
import { getJson, patchJson } from "@/lib/apiClient";
import { ALL_LGAS } from "@/lib/nigeria-locations";

interface Profile {
  firstName: string;
  lastName: string | null;
  bio: string | null;
  lga: string | null;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [lga, setLga] = useState(ALL_LGAS[0]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const res = await getJson<{ profile: Profile }>("/api/me/profile");
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    setFirstName(res.data.profile.firstName);
    setLastName(res.data.profile.lastName || "");
    setBio(res.data.profile.bio || "");
    setLga(res.data.profile.lga || ALL_LGAS[0]);
    setLoaded(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount; load() sets state asynchronously after awaiting the API.
    load();
  }, [load]);

  async function save() {
    setSaving(true);
    setError(null);
    const res = await patchJson("/api/me/profile", { firstName, lastName, bio, lga });
    setSaving(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    router.push("/profile");
  }

  if (error && !loaded) return <ErrorState message={error} onRetry={load} />;
  if (!loaded) return <LoadingState label="Loading profile…" />;

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
        <FormField label="First name (public)" value={firstName} onChange={setFirstName} required />
        <FormField label="Family name (private)" value={lastName} onChange={setLastName} />
        <FormField label="Bio" value={bio} onChange={setBio} multiline rows={3} maxLength={160} />
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
        <PButton label={saving ? "Saving…" : "Save changes"} onClick={save} disabled={saving} />
      </div>
    </main>
  );
}
