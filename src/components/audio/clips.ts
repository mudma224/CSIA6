import type { Locale } from "@/i18n/locale";

export type AudioTopic = "onboarding";

// Empty until real, linguistically reviewed and permitted recordings are delivered.
// When approved: add actual public/audio/{en,ary}/... files and URL mappings here.
export const audioClips: Record<Locale, Partial<Record<AudioTopic, string>>> = {
  en: {},
  ary: {},
};
