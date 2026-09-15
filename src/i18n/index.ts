import en from "./en.json";
import ha from "./ha.json";
import yo from "./yo.json";
import ig from "./ig.json";

export type Locale = "en" | "ha" | "yo" | "ig";

const dictionaries: Record<Locale, Record<string, string>> = {
  en: en as Record<string, string>,
  ha: ha as Record<string, string>,
  yo: yo as Record<string, string>,
  ig: ig as Record<string, string>,
};

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  yo: "Yorùbá",
  ha: "Hausa",
  ig: "Ìgbò",
};

/**
 * Translation lookup. Falls back to English when a key is missing in the
 * target locale (per spec: "can fall back to English until translations
 * arrive" — this is the mechanism, applies especially to `ig`).
 */
export function t(locale: Locale, key: string): string {
  return dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key;
}

export function getDictionary(locale: Locale): Record<string, string> {
  return { ...dictionaries.en, ...dictionaries[locale] };
}
