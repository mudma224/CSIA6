import type { Locale } from "./locale";

export const messages = {
  en: {
    language: "Language",
    english: "English",
    darija: "Darija",
    badge: "M0 · UI foundation preview",
    title: "Ready to build accessible farm tools",
    introduction: "This preview checks our design tokens and reusable controls. It is not the farmer application yet.",
    inputLabel: "Test field (local only)",
    inputHint: "Type here, then change language. Your text should remain.",
    sampleButton: "Try the button",
    buttonResult: "The button works locally. No data was sent.",
    audioHelp: "Audio help",
    audioTranscript: "Tap the speaker to hear help when a reviewed recording is available. The written instruction always stays visible.",
    audioMissing: "No reviewed recording is available yet. Use the written instructions.",
    audioError: "Audio could not play. Please use the written instructions.",
    playAudio: "Play audio",
    pauseAudio: "Pause audio",
    resumeAudio: "Resume audio",
    replayAudio: "Replay audio",
    rotationTitle: "Crop recommendations",
    rotationUnavailable: "Recommendations are not available yet. We are waiting for an approved model and data-science handoff.",
    demoOnly: "Foundation preview · local UI only · no login, map data or backend",
  },
  ary: {
    language: "اللغة",
    english: "الإنجليزية",
    darija: "الدارجة",
    badge: "M0 · تجربة عناصر الواجهة",
    title: "كنوجدو واجهة سهلة للاستعمال للفلاحة",
    introduction: "هاد الصفحة غير تجربة ديال الألوان والأزرار واللغة. ماشي التطبيق النهائي ديال الفلاح.",
    inputLabel: "خانة للتجربة فقط",
    inputHint: "كتب شي حاجة وبدل اللغة. اللي كتبتي خاصو يبقى.",
    sampleButton: "جرّب الزر",
    buttonResult: "الزر خدام غير هنا. ما تصيفطات حتى معلومة.",
    audioHelp: "المساعدة بالصوت",
    audioTranscript: "ملي يكون تسجيل صوتي مراجع، تقدر تضغط على السماعة وتسمع الشرح. الشرح مكتوب ديما.",
    audioMissing: "مازال ما كاين حتى تسجيل صوتي مراجع. استعمل الشرح المكتوب.",
    audioError: "ما قدرناش نشغلو الصوت. استعمل الشرح المكتوب.",
    playAudio: "شغّل الصوت",
    pauseAudio: "وقف الصوت",
    resumeAudio: "كمّل الصوت",
    replayAudio: "عاود الصوت",
    rotationTitle: "اقتراحات الزراعة",
    rotationUnavailable: "اقتراحات الزراعة مازال ما متوفراش. كنتسناو المصادقة على النموذج وتسليم فريق البيانات.",
    demoOnly: "تجربة الواجهة فقط · المعلومات محلية · بلا حساب ولا خريطة ولا خادم",
  },
} as const;

export type MessageKey = keyof typeof messages.en;

export function translate(locale: Locale, key: MessageKey): string {
  return messages[locale][key];
}
