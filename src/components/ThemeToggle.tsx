"use client";

import { Moon, Sun } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "sherise-theme";
type Theme = "light" | "dark";

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("sherise-theme-change", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("sherise-theme-change", listener);
  };
}
function getTheme(): Theme {
  return window.localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  const { tr } = useLanguage();
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light" as Theme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    const next: Theme = theme === "light" ? "dark" : "light";
    window.localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event("sherise-theme-change"));
    applyTheme(next);
  }

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className="sr-theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <Sun size={17} strokeWidth={2} />
      ) : (
        <Moon size={17} strokeWidth={2} />
      )}
      <span>{tr(isDark ? "Light" : "Dark")}</span>
    </button>
  );
}
