"use client";
import { useState } from "react";
import { Globe } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LANGUAGES, setLocalLanguage, useLanguage } from "@/i18n/LanguageProvider";
import { patchJson } from "@/lib/apiClient";
export function AppPreferences() {
  const { locale, tr } = useLanguage();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return <div className="sr-app-preferences">
    <label><Globe size={17} aria-hidden="true" /><span>{tr("Language")}</span><select aria-label="Language / Harshe / Èdè" value={locale} disabled={busy} onChange={async event => {
      const value = event.target.value; setLocalLanguage(value); setError(""); setBusy(true);
      const result = await patchJson("/api/me/settings", { language: value });
      setBusy(false);
      if (!result.ok && result.status !== 401) setError(tr("Something went wrong. Please try again."));
    }}>{Object.entries(LANGUAGES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <ThemeToggle />
    {error && <span role="alert">{error}</span>}
  </div>;
}
