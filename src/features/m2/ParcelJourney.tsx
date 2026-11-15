"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { ChoiceGroup } from "@/components/forms/ChoiceGroup";
import { LocaleSwitcher } from "@/components/m1/LocaleSwitcher";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { useM2Text } from "@/i18n/m2Messages";
import type { M2MessageKey } from "@/i18n/m2Messages";
import {
  emptyParcelDraft, firstInvalidStep, validateParcelStep,
} from "./parcelDraft";
import type {
  ParcelDraft, ParcelErrorField, ParcelErrors, ParcelStep,
  ZoneChoice, IrrigationChoice, LocationChoice, PlannedSeasonChoice,
} from "./parcelDraft";

export function ParcelJourney() {
  const tx = useM2Text();
  const [draft, setDraft] = useState<ParcelDraft>({ ...emptyParcelDraft });
  const [step, setStep] = useState<ParcelStep>(0);
  const [errors, setErrors] = useState<ParcelErrors>({});
  const [confirmed, setConfirmed] = useState(false);

  const stepLabels: M2MessageKey[] = ["step1", "step2", "step3", "step4"];

  function update<K extends keyof ParcelDraft>(key: K, value: ParcelDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function error(field: ParcelErrorField): string | undefined {
    const code = errors[field];
    return code ? tx(code) : undefined;
  }

  function goBack() {
    setErrors({});
    setStep((current) => (current > 0 ? (current - 1) as ParcelStep : current));
  }

  function submitLocalForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // IMPORTANT: no browser navigation, POST or remote save
    if (step < 3) {
      const currentErrors = validateParcelStep(draft, step as 0 | 1 | 2);
      if (Object.keys(currentErrors).length) {
        setErrors(currentErrors);
        return;
      }
      setErrors({});
      setStep((step + 1) as ParcelStep);
      return;
    }

    // Recheck every prior step before displaying the local confirmation state.
    const invalid = firstInvalidStep(draft);
    if (invalid !== null) {
      setStep(invalid);
      setErrors(validateParcelStep(draft, invalid));
      return;
    }
    setErrors({});
    setConfirmed(true); // no submission or persistence
  }

  function reset() {
    setDraft({ ...emptyParcelDraft });
    setErrors({});
    setStep(0);
    setConfirmed(false);
  }

  const zoneOptions: { value: ZoneChoice; label: string }[] = [
    { value: "amir", label: tx("zoneAmir") },
    { value: "moussa", label: tx("zoneMoussa") },
    { value: "other", label: tx("zoneOther") },
    { value: "unsure", label: tx("unsure") },
  ];
  const irrigationOptions: { value: IrrigationChoice; label: string }[] = [
    { value: "drip-ui", label: tx("irrigationDrip") },
    { value: "surface-ui", label: tx("irrigationSurface") },
    { value: "other-ui", label: tx("irrigationOther") },
    { value: "unsure", label: tx("unsure") },
  ];
  const locationOptions: { value: LocationChoice; label: string }[] = [
    { value: "none", label: tx("locationNone") },
    { value: "manual", label: tx("locationManual") },
  ];
  const seasonOptions: { value: PlannedSeasonChoice; label: string }[] = [
    { value: "known", label: tx("seasonKnown") },
    { value: "unsure", label: tx("seasonUnknown") },
  ];

  function labelForZone(): string {
    return zoneOptions.find((item) => item.value === draft.zone)?.label ?? tx("notProvided");
  }
  function labelForIrrigation(): string {
    return irrigationOptions.find((item) => item.value === draft.irrigation)?.label ?? tx("notProvided");
  }
  function display(value: string): string { return value.trim() || tx("notProvided"); }

  function reviewRow(label: string, value: string) {
    return (
      <div key={label} className="grid gap-1 border-b border-[var(--border)] py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
        <dt className="font-semibold text-forest">{label}</dt>
        <dd className="min-w-0 break-words text-ink"><bdi>{value}</bdi></dd>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-3">
        <p className="font-bold text-leaf">{tx("formEyebrow")}</p>
        <h1 className="text-3xl font-extrabold text-forest sm:text-4xl">{tx("formTitle")}</h1>
        <p className="text-base text-ink">{tx("formIntro")}</p>
        <LocaleSwitcher />
        <p className="rounded-[var(--radius-md)] bg-mint p-3 text-sm text-forest">{tx("formPrivacy")}</p>
      </header>

      {confirmed ? (
        <Card className="space-y-5" >
          <div role="status" aria-live="polite" className="space-y-3">
            <h2 className="text-2xl font-bold text-forest">{tx("statusTitle")}</h2>
            <p>{tx("statusDescription")}</p>
            <p className="text-sm text-muted">{tx("recommendationsUnavailable")}</p>
          </div>
          <Button type="button" onClick={reset}>{tx("startAgain")}</Button>
          <Link href="/rotation" className="inline-flex min-h-11 items-center px-3 font-bold text-forest underline">{tx("cancel")}</Link>
        </Card>
      ) : (
        <>
          <nav aria-label={tx("progressLabel")}>
            <ol className="grid grid-cols-4 gap-2">
              {stepLabels.map((label, index) => (
                <li
                  key={label}
                  aria-current={step === index ? "step" : undefined}
                  className={`rounded-[var(--radius-sm)] px-2 py-3 text-center text-xs font-semibold sm:text-sm ${index === step ? "bg-forest text-white" : "bg-mint text-forest"}`}
                >
                  <span className="block">{index + 1}</span>
                  <span className="block break-words">{tx(label)}</span>
                </li>
              ))}
            </ol>
          </nav>
          <Card className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-leaf" aria-live="polite">
                {tx("stepCounter")} {step + 1} {tx("of")} 4
              </p>
              <h2 className="mt-1 text-2xl font-bold text-forest">{tx(stepLabels[step])}</h2>
              {step < 3 && <p className="mt-2 text-sm text-muted">{tx("requiredNote")}</p>}
            </div>

            <form noValidate onSubmit={submitLocalForm} className="space-y-6">
              {step === 0 && (
                <>
                  <TextField
                    label={tx("nameLabel")}
                    hint={tx("nameHint")}
                    placeholder={tx("namePlaceholder")}
                    error={error("parcelName")}
                    maxLength={60}
                    value={draft.parcelName}
                    onChange={(event) => update("parcelName", event.target.value)}
                  />
                  <ChoiceGroup
                    name="m2-zone"
                    legend={tx("zoneLabel")}
                    hint={tx("zoneHint")}
                    value={draft.zone}
                    options={zoneOptions}
                    onChange={(value) => update("zone", value)}
                    error={error("zone")}
                  />
                  <TextField
                    label={tx("areaLabel")}
                    hint={tx("areaHint")}
                    placeholder={tx("areaPlaceholder")}
                    type="text"
                    inputMode="decimal"
                    error={error("areaHa")}
                    value={draft.areaHa}
                    onChange={(event) => update("areaHa", event.target.value)}
                  />
                </>
              )}

              {step === 1 && (
                <>
                  <ChoiceGroup
                    name="m2-irrigation"
                    legend={tx("irrigationLabel")}
                    hint={tx("irrigationHint")}
                    value={draft.irrigation}
                    options={irrigationOptions}
                    onChange={(value) => update("irrigation", value)}
                    error={error("irrigation")}
                  />
                  <ChoiceGroup
                    name="m2-location"
                    legend={tx("locationLabel")}
                    hint={tx("locationHint")}
                    value={draft.locationChoice}
                    options={locationOptions}
                    onChange={(value) => {
                      update("locationChoice", value);
                      setErrors((prev) => ({ ...prev, latitude: undefined, longitude: undefined }));
                    }}
                  />
                  {draft.locationChoice === "manual" && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextField
                        label={tx("latLabel")}
                        hint={tx("coordinatesHint")}
                        type="text"
                        inputMode="decimal"
                        error={error("latitude")}
                        value={draft.latitude}
                        onChange={(event) => update("latitude", event.target.value)}
                      />
                      <TextField
                        label={tx("lonLabel")}
                        hint={tx("coordinatesHint")}
                        type="text"
                        inputMode="decimal"
                        error={error("longitude")}
                        value={draft.longitude}
                        onChange={(event) => update("longitude", event.target.value)}
                      />
                    </div>
                  )}
                  <p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-cream p-4 text-sm text-muted">
                    {tx("mapLater")}
                  </p>
                </>
              )}

              {step === 2 && (
                <>
                  <p className="rounded-[var(--radius-md)] bg-mint p-4 text-sm text-forest">{tx("cropIntro")}</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                      label={tx("recentCrop")}
                      placeholder={tx("cropPlaceholder")}
                      maxLength={80}
                      error={error("recentCrop")}
                      value={draft.recentCrop}
                      onChange={(event) => update("recentCrop", event.target.value)}
                    />
                    <TextField
                      label={tx("recentCropSeason")}
                      hint={tx("cropSeasonHint")}
                      maxLength={40}
                      error={error("recentCropSeason")}
                      value={draft.recentCropSeason}
                      onChange={(event) => update("recentCropSeason", event.target.value)}
                    />
                    <TextField
                      label={tx("earlierCrop")}
                      placeholder={tx("cropPlaceholder")}
                      maxLength={80}
                      error={error("earlierCrop")}
                      value={draft.earlierCrop}
                      onChange={(event) => update("earlierCrop", event.target.value)}
                    />
                    <TextField
                      label={tx("earlierCropSeason")}
                      hint={tx("cropSeasonHint")}
                      maxLength={40}
                      error={error("earlierCropSeason")}
                      value={draft.earlierCropSeason}
                      onChange={(event) => update("earlierCropSeason", event.target.value)}
                    />
                  </div>
                  <ChoiceGroup
                    name="m2-season-choice"
                    legend={tx("seasonModeLabel")}
                    value={draft.seasonChoice}
                    options={seasonOptions}
                    onChange={(value) => update("seasonChoice", value)}
                    error={error("seasonChoice")}
                  />
                  {draft.seasonChoice === "known" && (
                    <TextField
                      label={tx("seasonLabel")}
                      hint={tx("seasonHint")}
                      maxLength={40}
                      error={error("plannedSeason")}
                      value={draft.plannedSeason}
                      onChange={(event) => update("plannedSeason", event.target.value)}
                    />
                  )}
                </>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted">{tx("reviewIntro")}</p>
                  <dl>
                    {reviewRow(tx("nameLabel"), display(draft.parcelName))}
                    {reviewRow(tx("zoneLabel"), labelForZone())}
                    {reviewRow(tx("areaLabel"), draft.areaHa.trim() ? `${draft.areaHa.trim()} ${tx("areaUnit")}` : tx("notProvided"))}
                    {reviewRow(tx("irrigationLabel"), labelForIrrigation())}
                    {reviewRow(tx("reviewLocation"), draft.locationChoice === "none"
                      ? tx("notProvided")
                      : `${tx("reviewUnverified")}: ${draft.latitude.trim()}, ${draft.longitude.trim()}`)}
                    {reviewRow(tx("recentCrop"), display(draft.recentCrop))}
                    {reviewRow(tx("recentCropSeason"), display(draft.recentCropSeason))}
                    {reviewRow(tx("earlierCrop"), display(draft.earlierCrop))}
                    {reviewRow(tx("earlierCropSeason"), display(draft.earlierCropSeason))}
                    {reviewRow(tx("reviewSeason"), draft.seasonChoice === "unsure" ? tx("userUnsure") : display(draft.plannedSeason))}
                  </dl>
                  <p className="rounded-[var(--radius-md)] bg-mint p-3 text-sm font-semibold text-forest">
                    {tx("recommendationsUnavailable")}
                  </p>
                </div>
              )}

              {Object.values(errors).some(Boolean) && (
                <p role="alert" className="rounded-[var(--radius-md)] border border-[var(--danger)] p-3 text-sm font-semibold text-[var(--danger)]">
                  {tx("errorHeading")}
                </p>
              )}

              <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-between">
                {step === 0 ? (
                  <Link href="/rotation" className="inline-flex min-h-11 items-center justify-center px-4 font-semibold text-forest underline">
                    {tx("cancel")}
                  </Link>
                ) : (
                  <Button type="button" variant="outline" onClick={goBack}>{tx("back")}</Button>
                )}
                <Button type="submit">{step === 3 ? tx("confirm") : tx("next")}</Button>
              </div>
            </form>
          </Card>
        </>
      )}
    </div>
  );
}
