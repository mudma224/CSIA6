"use client";

import Link from "next/link";
import { Sprout } from "lucide-react";
import type { ReactNode } from "react";
import { LocaleSwitcher } from "@/components/m1/LocaleSwitcher";
import { useLocale } from "@/i18n/LocaleProvider";
import { PrimaryNav } from "./PrimaryNav";

export function AppFrame({ children }: { children: ReactNode }) {
  const { t } = useLocale();

  return (
    <div className="mx-auto min-h-dvh max-w-7xl md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-3 focus:top-3 focus:z-50 focus:rounded-[var(--radius-md)] focus:bg-white focus:p-3 focus:font-bold focus:text-forest focus:outline-4"
      >
        {t("skipToContent")}
      </a>
      <aside className="hidden border-e border-[var(--border)] bg-cream px-4 py-7 md:block">
        <Link href="/home" className="mb-9 flex min-h-11 items-center gap-2 font-bold text-forest focus-visible:outline-4">
          <Sprout aria-hidden="true" /> flaht bladi
        </Link>
        <PrimaryNav />
      </aside>
      <div className="min-w-0 pb-24 md:pb-0">
        <header className="border-b border-[var(--border)] bg-cream px-4 py-4 sm:px-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/home" className="inline-flex min-h-11 items-center gap-2 text-xl font-bold text-forest focus-visible:outline-4 md:hidden">
              <Sprout aria-hidden="true" /> flaht bladi
            </Link>
            <p className="min-w-0 text-sm font-semibold text-forest">{t("frontendDemoNote")}</p>
            <LocaleSwitcher />
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="mx-auto max-w-4xl px-4 py-7 focus:outline-4 focus:outline-offset-4 focus:outline-leaf sm:px-7 sm:py-10">
          {children}
        </main>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-cream px-1 pb-[env(safe-area-inset-bottom)] md:hidden">
        <PrimaryNav mobile />
      </div>
    </div>
  );
}
