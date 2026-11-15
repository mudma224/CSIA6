"use client";

import { CircleAlert, House, RotateCcw } from "lucide-react";
import { ActionLink } from "@/components/m1/ActionLink";
import { LocaleSwitcher } from "@/components/m1/LocaleSwitcher";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useM5Text } from "@/i18n/m5Messages";

type Props =
  | { kind: "not-found"; onRetry?: never }
  | { kind: "error"; onRetry: () => void };

export function RecoveryScreen(props: Props) {
  const t = useM5Text();
  const missing = props.kind === "not-found";

  return (
    <Card className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-start gap-3">
        <CircleAlert aria-hidden="true" className="mt-1 shrink-0 text-leaf" size={28} />
        <div className="min-w-0 space-y-2">
          <h1 className="text-2xl font-extrabold text-forest sm:text-3xl">
            {missing ? t("notFoundTitle") : t("errorTitle")}
          </h1>
          <p className="text-base text-ink">
            {missing ? t("notFoundBody") : t("errorBody")}
          </p>
        </div>
      </div>
      <p className="rounded-[var(--radius-md)] bg-mint p-4 text-sm text-forest">
        {t("recoveryNote")}
      </p>
      <div className="flex flex-wrap gap-3">
        {!missing && (
          <Button type="button" onClick={props.onRetry}>
            <RotateCcw aria-hidden="true" size={18} /> {t("retry")}
          </Button>
        )}
        <ActionLink href="/home" variant="outline">
          <House aria-hidden="true" size={18} /> {t("home")}
        </ActionLink>
        <ActionLink href="/" variant="outline">{t("welcome")}</ActionLink>
      </div>
      <LocaleSwitcher />
    </Card>
  );
}
