"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, MapPinned, Sprout, UsersRound, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import type { MessageKey } from "@/i18n/messages";

const items: { href: string; label: MessageKey; icon: LucideIcon }[] = [
  { href: "/home", label: "navHome", icon: House },
  { href: "/rotation", label: "navRotation", icon: Sprout },
  { href: "/map", label: "navMap", icon: MapPinned },
  { href: "/community", label: "navCommunity", icon: UsersRound },
  { href: "/profile", label: "navProfile", icon: UserRound },
];

export function PrimaryNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const { t } = useLocale();
  return (
    <nav aria-label={t("primaryNavigation")} className={mobile ? "flex w-full" : "flex flex-col gap-2"}>
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href === "/rotation" && pathname.startsWith("/parcels/"));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-14 min-w-0 items-center justify-center gap-1 rounded-[var(--radius-md)] px-1 py-2 font-semibold transition-colors ${mobile ? "flex-1 flex-col text-[11px]" : "justify-start gap-3 px-4 text-base"} ${active ? "bg-mint text-forest" : "text-muted hover:bg-white hover:text-forest"}`}
          >
            <Icon size={20} aria-hidden="true" className="shrink-0" />
            <span className="max-w-full text-center leading-tight [overflow-wrap:anywhere]">{t(label)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
