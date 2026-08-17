"use client";

import { useEffect } from "react";
import { detectLocale, isLocale } from "./i18n";

const STORAGE_KEY = "kana-quest-progress-v1";

export default function LocaleRedirect() {
  useEffect(() => {
    let locale = detectLocale(window.navigator.languages);
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as { settings?: { locale?: string } } | null;
      if (saved?.settings?.locale && isLocale(saved.settings.locale)) locale = saved.settings.locale;
    } catch {
      // A damaged local save should never prevent language selection.
    }
    const nextUrl = new URL(window.location.href);
    nextUrl.pathname = `/${locale}`;
    window.location.replace(nextUrl.toString());
  }, []);

  return <main className="loading-screen">Choosing your language…</main>;
}
