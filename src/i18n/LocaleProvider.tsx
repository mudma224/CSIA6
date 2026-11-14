"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { directionFor, isLocale, LOCALE_STORAGE_KEY } from "./locale";
import type { Locale } from "./locale";
import { translate } from "./messages";
import type { MessageKey } from "./messages";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: MessageKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setCurrentLocale] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read persisted locale after hydration.
      if (isLocale(saved)) setCurrentLocale(saved);
    } catch {
      // Private browsing or disabled storage must not block the UI.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = directionFor(locale);
  }, [locale]);

  function setLocale(next: Locale) {
    setCurrentLocale(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Language switching still works for the current session.
    }
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: (key) => translate(locale, key) }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}
