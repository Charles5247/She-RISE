"use client";
// Screen 06 — Language + Skill picker. Radio cards for language, 6-tile grid
// for skill category. Final onboarding step -> feed.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, PButton, CheckIcon } from "@/components";
import { postJson } from "@/lib/apiClient";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ha", label: "Hausa" },
  { code: "yo", label: "Yorùbá" },
  { code: "ig", label: "Ìgbò" },
];

const SKILLS = [
  { code: "Tailoring & Fashion", label: "Tailoring & Fashion", emoji: "🧵" },
  { code: "Catering & Baking", label: "Catering & Baking", emoji: "🍰" },
  { code: "Soap & Bead Making", label: "Soap & Bead Making", emoji: "🧼" },
  { code: "Digital Marketing", label: "Digital Marketing", emoji: "📱" },
  { code: "Content Creation", label: "Content Creation", emoji: "🎬" },
];

export default function PreferencesPage() {
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  const [skill, setSkill] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!skill) {
      setError("Pick a skill pathway to get started.");
      return;
    }
    setError(null);
    setLoading(true);
    // firstName/lga are already saved by the profile step; complete-profile
    // requires firstName + lga on every call, so re-send from the session user.
    const me = await fetch("/api/auth/me").then((r) => r.json()).catch(() => null);
    const result = await postJson("/api/auth/complete-profile", {
      firstName: me?.user?.first_name,
      lastName: me?.user?.last_name,
      lga: me?.user?.lga,
      language,
      skillCategory: skill,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.push("/feed");
  }

  return (
    <AuthShell title="Choose your path" subtitle="Pick a language, then the skill you'd like to learn.">
      <div className="flex flex-col gap-6">
        <div>
          <div className="sr-label" style={{ fontSize: 10, color: "var(--c-ink-soft)", marginBottom: 8 }}>
            Language
          </div>
          <div className="flex flex-col gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
                style={{
                  borderColor: language === l.code ? "var(--c-magenta)" : "var(--c-line)",
                  background: language === l.code ? "rgba(212,48,110,0.06)" : "#fff",
                  color: "var(--c-ink)",
                }}
              >
                {l.label}
                {language === l.code && <CheckIcon size={16} style={{ color: "var(--c-magenta)" }} />}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="sr-label" style={{ fontSize: 10, color: "var(--c-ink-soft)", marginBottom: 8 }}>
            Skill pathway
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SKILLS.map((s) => (
              <button
                key={s.code}
                type="button"
                onClick={() => setSkill(s.code)}
                className="flex flex-col items-center gap-2 rounded-lg border p-4 text-xs font-semibold text-center"
                style={{
                  borderColor: skill === s.code ? "var(--c-magenta)" : "var(--c-line)",
                  background: skill === s.code ? "rgba(212,48,110,0.06)" : "#fff",
                  color: "var(--c-ink)",
                }}
              >
                <span style={{ fontSize: 24 }}>{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        {error && (
          <p className="text-xs" style={{ color: "var(--c-danger)" }}>
            {error}
          </p>
        )}
        <PButton label={loading ? "Saving…" : "Start my journey"} onClick={submit} disabled={loading} />
      </div>
    </AuthShell>
  );
}
