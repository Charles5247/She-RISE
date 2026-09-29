"use client";
import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { translateUi } from "./ui";
export const LANGUAGES = { en: "English", ha: "Hausa", yo: "Yorùbá", pcm: "Pidgin English", ig: "Igbo" };
export type Language = keyof typeof LANGUAGES;
const Context = createContext<{ locale: Language; tr: (text: string) => string }>({ locale: "en", tr: text => text });
function subscribe(fn: () => void) {
  window.addEventListener("sherise-language", fn); window.addEventListener("storage", fn);
  return () => { window.removeEventListener("sherise-language", fn); window.removeEventListener("storage", fn); };
}
function snapshot(): Language {
  try { const value = localStorage.getItem("sherise-language"); return value && value in LANGUAGES ? value as Language : "en"; } catch { return "en"; }
}
export function setLocalLanguage(language: string) {
  if (!(language in LANGUAGES)) return;
  try { localStorage.setItem("sherise-language", language); } catch { /* Storage may be disabled. */ }
  window.dispatchEvent(new Event("sherise-language"));
}
export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, snapshot, () => "en" as Language);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  return <Context.Provider value={{ locale, tr: text => translateUi(locale, text) }}>{children}</Context.Provider>;
}
export const useLanguage = () => useContext(Context);
export function T({ text }: { text: string }) { return useLanguage().tr(text); }
