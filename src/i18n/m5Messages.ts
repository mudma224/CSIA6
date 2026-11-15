import { useLocale } from "@/i18n/LocaleProvider";

export const m5Messages = {
  en: {
    notFoundTitle: "This page is not available",
    notFoundBody: "The address may be wrong or the page may have moved. No parcel or recommendation was loaded.",
    errorTitle: "This screen could not open",
    errorBody: "A display error occurred. You can try again or return to Home. This message is not a server or model result.",
    retry: "Try this screen again",
    home: "Return to Home",
    welcome: "Return to welcome",
    recoveryNote: "flaht bladi is currently a frontend demonstration. Saving, accounts and crop recommendations are not connected.",
  },
  ary: {
    notFoundTitle: "هاد الصفحة ما متوفراش",
    notFoundBody: "يمكن العنوان غلط ولا تبدلات الصفحة. ما تحملات لا أرض لا اقتراح زراعي.",
    errorTitle: "ما قدرناش نحلو هاد الشاشة",
    errorBody: "وقع مشكل فالعرض. تقدر تعاود المحاولة ولا ترجع للرئيسية. هادي ماشي نتيجة من الخادم ولا النموذج.",
    retry: "عاود جرّب هاد الشاشة",
    home: "رجع للرئيسية",
    welcome: "رجع للاستقبال",
    recoveryNote: "فلاحت بلادي دابا غير تجربة للواجهة. الحفظ والحسابات والاقتراحات الزراعية مازال ما مربوطينش.",
  },
} as const;

export type M5MessageKey = keyof typeof m5Messages.en;

export function useM5Text(): (key: M5MessageKey) => string {
  const { locale } = useLocale();
  return (key: M5MessageKey) => m5Messages[locale][key];
}
