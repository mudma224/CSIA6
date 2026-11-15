"use client";

import { useState } from "react";
import { LocaleSwitcher } from "@/components/m1/LocaleSwitcher";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { useLocale } from "@/i18n/LocaleProvider";

export function ProfileScreen() {
  const { t } = useLocale();
  const [displayName, setDisplayName] = useState("");
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold text-forest">{t("profileTitle")}</h1>
        <p className="mt-2 text-muted">{t("profileNotAccount")}</p>
      </header>
      <Card className="space-y-5">
        <TextField
          label={t("displayNameLabel")}
          hint={t("displayNameHint")}
          value={displayName}
          maxLength={50}
          onChange={(event) => setDisplayName(event.target.value)}
        />
        <div className="space-y-2">
          <h2 className="font-bold text-forest">{t("chooseLanguage")}</h2>
          <LocaleSwitcher />
        </div>
      </Card>
      <Card>
        <h2 className="text-lg font-bold text-forest">{t("savedItemsTitle")}</h2>
        <p className="mt-2 text-muted">{t("savedItemsEmpty")}</p>
      </Card>
    </div>
  );
}
