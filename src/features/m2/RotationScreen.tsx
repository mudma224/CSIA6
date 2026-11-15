"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Info, Sprout } from "lucide-react";
import { ActionLink } from "@/components/m1/ActionLink";
import { LocaleSwitcher } from "@/components/m1/LocaleSwitcher";
import { Card } from "@/components/ui/Card";
import { useLocale } from "@/i18n/LocaleProvider";
import { translate } from "@/i18n/messages";
import { useM2Text } from "@/i18n/m2Messages";
import { RECOMMENDATION_STORAGE_KEY } from "./ParcelJourney";
import {
  validateScienceResponse,
  type ResultsAvailable,
  type ScienceResponse,
  type ScoredOption,
} from "@/lib/recommendationTypes";

type StoredPayload = ScienceResponse & { receivedAt?: string };

function OptionCard({
  option, tx, locale, rank,
}: {
  option: ScoredOption;
  tx: (key: import("@/i18n/m2Messages").M2MessageKey) => string;
  locale: "en" | "ary";
  rank: number | null;
}) {
  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-bold text-forest">
          <bdi>{locale === "ary" ? option.name_ar : option.name_en}</bdi>
        </h3>
        {rank !== null && (
          <span className="rounded-[var(--radius-pill)] bg-mint px-3 py-1 text-sm font-bold text-forest">
            {tx("recRankLabel")} {rank}
          </span>
        )}
      </div>
      <p className="text-3xl font-extrabold text-forest" aria-label={`${option.score}`}>
        {option.score}
        <span className="ms-2 align-middle text-sm font-semibold text-muted">/ 100</span>
      </p>
      <p className="text-xs text-muted">{tx("recScoreNote")}</p>
      <div className="space-y-2">
        <h4 className="text-sm font-bold text-forest">{tx("recEvidenceHeading")}</h4>
        {option.rule_evidence.length === 0 ? (
          <p className="text-sm text-muted">{tx("recEvidenceEmpty")}</p>
        ) : (
          <ul className="space-y-1">
            {option.rule_evidence.map((e) => (
              <li key={`${option.crop_id}-${e.rule_id}`} className="text-sm text-ink">
                <span className="me-2 inline-block rounded-[var(--radius-sm)] bg-cream px-2 py-0.5 font-mono text-xs text-forest">
                  {e.rule_id}
                </span>
                {e.delta > 0 ? `+${e.delta}` : e.delta} · <bdi>{locale === "ary" ? e.explanation_ary_pending_review : e.explanation}</bdi>
                {locale === "ary" && <span className="ms-1 text-xs text-muted">({tx("recAryPending")})</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
      {option.water_evidence && (
        <p className="text-sm text-ink">
          {tx("recWater")}: {option.water_evidence.crop_water_need_mm_estimate[0]}–{option.water_evidence.crop_water_need_mm_estimate[1]} mm
          <span className="ms-2 text-xs text-muted">{tx("recWaterLabel")}</span>
        </p>
      )}
      {option.notes.length > 0 && (
        <p className="font-mono text-xs text-muted">{option.notes.join(" · ")}</p>
      )}
    </Card>
  );
}

function ResultsView({ payload }: { payload: ResultsAvailable }) {
  const { locale } = useLocale();
  const tx = useM2Text();
  const shown = payload.alternatives.slice(0, 2);
  return (
    <div className="space-y-6">
      <p className="rounded-[var(--radius-md)] bg-cream p-3 text-sm text-ink">{tx("recDemoNote")}</p>
      {payload.warnings?.includes("baseline_repetition_blocked_by_rule") && (
        <p role="alert" className="rounded-[var(--radius-md)] border border-[var(--danger)] bg-cream p-4 text-sm font-semibold text-ink">
          {tx("warnBaselineBlocked")}
        </p>
      )}
      {payload.warnings?.includes("season_absent_results_generic") && (
        <p className="rounded-[var(--radius-md)] bg-cream p-3 text-sm text-muted">{tx("warnSeasonGeneric")}</p>
      )}
      {payload.warnings?.includes("priorities_not_provided_neutral_weights") && (
        <p className="rounded-[var(--radius-md)] bg-cream p-3 text-sm text-muted">{tx("warnNeutralWeights")}</p>
      )}

      <section aria-labelledby="baseline-heading" className="space-y-3">
        <h2 id="baseline-heading" className="text-xl font-extrabold text-forest">{tx("recBaselineHeading")}</h2>
        {payload.baseline ? (
          <OptionCard option={payload.baseline} tx={tx} locale={locale} rank={null} />
        ) : (
          <Card><p className="text-ink">{tx("recBaselineNull")}</p></Card>
        )}
      </section>

      <section aria-labelledby="alternatives-heading" className="space-y-3">
        <h2 id="alternatives-heading" className="text-xl font-extrabold text-forest">{tx("recAlternativesHeading")}</h2>
        <div className="space-y-4">
          {shown.map((a) => (
            <OptionCard key={a.crop_id} option={a} tx={tx} locale={locale} rank={a.rank ?? null} />
          ))}
        </div>
        {payload.alternatives.length > 2 && (
          <p className="text-sm text-muted">{tx("recTwoShownNote")}</p>
        )}
      </section>
    </div>
  );
}

export function RotationScreen() {
  const tx = useM2Text();
  const { locale } = useLocale();
  const [payload, setPayload] = useState<StoredPayload | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Deferred one tick: sessionStorage is browser-only, so the static prerender
    // always paints the honest intro first (no hydration mismatch).
    const read = async () => {
      try {
        const raw = sessionStorage.getItem(RECOMMENDATION_STORAGE_KEY);
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          const validated = validateScienceResponse(parsed);
          if (validated && !cancelled) setPayload(validated as StoredPayload);
        }
      } catch {
        // ignore malformed storage content; the honest intro state is shown
      }
      if (!cancelled) setLoaded(true);
    };
    void read();
    return () => { cancelled = true; };
  }, []);

  function clearAndStart() {
    sessionStorage.removeItem(RECOMMENDATION_STORAGE_KEY);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-3 text-forest">
          <Info aria-hidden="true" />
          <h1 className="text-3xl font-extrabold sm:text-4xl">{translate(locale, "rotationTitle")}</h1>
        </div>
        <LocaleSwitcher />
      </header>

      {!loaded ? null : payload === null ? (
        <div className="space-y-5">
          <Card className="space-y-4">
            <p className="text-ink">{tx("rotationIntro")}</p>
            <p className="text-sm text-muted">{tx("recHowItWorks")}</p>
          </Card>
          <Card className="space-y-4 bg-mint">
            <div className="flex items-center gap-3 text-forest">
              <Sprout aria-hidden="true" />
              <h2 className="text-xl font-bold">{tx("startParcel")}</h2>
            </div>
            <p className="text-ink">{tx("parcelEntryDescription")}</p>
            <ActionLink href="/parcels/new">{tx("startParcel")}</ActionLink>
          </Card>
          <ActionLink href="/home" variant="outline">{tx("backHome")}</ActionLink>
        </div>
      ) : payload.status === "results_available" ? (
        <ResultsView payload={payload} />
      ) : payload.status === "no_suitable_options" ? (
        <Card className="space-y-3">
          <h2 className="text-xl font-bold text-forest">{tx("recNoOptionsTitle")}</h2>
          <p className="text-ink">{tx("recNoOptionsBody")}</p>
          {payload.blocked.length > 0 && (
            <ul className="space-y-2">
              {payload.blocked.map((b) => (
                <li key={b.crop_id} className="text-sm text-ink">
                  <span className="me-2 font-mono text-xs text-forest">{b.reason_code}</span>
                  {b.crop_id}: {b.explanation}
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : payload.status === "request_error" ? (
        <Card className="space-y-3">
          <h2 className="text-xl font-bold text-forest">{tx("recInvalidTitle")}</h2>
          <p className="text-ink">{tx("recInvalidBody")}</p>
          <ul className="list-inside list-disc text-sm text-muted">
            {payload.error.fields.map((f, i) => (
              <li key={`${f.path}-${i}`}>{f.path} · {f.code}</li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card className="space-y-3">
          <h2 className="text-xl font-bold text-forest">{tx("recUnavailableTitle")}</h2>
          <p className="text-ink">{tx("recUnavailableBody")}</p>
        </Card>
      )}

      {loaded && payload !== null && (
        <div className="flex flex-wrap gap-3">
          <Link
            href="/parcels/new"
            onClick={clearAndStart}
            className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-forest bg-white px-4 font-semibold text-forest hover:bg-mint"
          >
            {tx("recStartNew")}
          </Link>
          <Link href="/home" className="inline-flex min-h-11 items-center px-3 font-semibold text-forest underline">
            {tx("backHome")}
          </Link>
        </div>
      )}
    </div>
  );
}

