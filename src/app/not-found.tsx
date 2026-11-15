import { LocaleProvider } from "@/i18n/LocaleProvider";
import { RecoveryScreen } from "@/features/m5/RecoveryScreen";

export default function NotFoundPage() {
  return (
    <LocaleProvider>
      <main id="main-content" className="mx-auto min-h-dvh max-w-4xl px-4 py-10 sm:py-16">
        <RecoveryScreen kind="not-found" />
      </main>
    </LocaleProvider>
  );
}
