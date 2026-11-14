export type Locale = "en" | "ary";
export const LOCALE_STORAGE_KEY = "flaht-bladi.locale";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "ary";
}

export function directionFor(locale: Locale): "ltr" | "rtl" {
  return locale === "ary" ? "rtl" : "ltr";
}
