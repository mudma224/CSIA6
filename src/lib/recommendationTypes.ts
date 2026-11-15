/**
 * Isomorphic types + runtime validators for the recommendation contract v0.2
 * (`contracts/model-input.md` + `contracts/model-output.md`).
 * No server-only imports: the rotation screen validates payloads with this too.
 */

export type ScienceStatus =
  | "results_available"
  | "no_suitable_options"
  | "demo_preview"
  | "model_unavailable"
  | "request_error";

export type RuleEvidence = {
  rule_id: string;
  delta: number;
  explanation: string;
  explanation_ary_pending_review: string;
};

export type WaterEvidence = {
  crop_water_need_mm_estimate: [number, number];
  estimate_source: string;
  estimate_label: string;
};

export type ScoredOption = {
  crop_id: string;
  name_en: string;
  name_ar: string;
  score: number;
  rank?: number | null;
  rule_evidence: RuleEvidence[];
  water_evidence: WaterEvidence | null;
  notes: string[];
};

export type Baseline = ScoredOption;

export type ResultsAvailable = {
  status: "results_available";
  contract_version: string;
  engine_version: string;
  data_versions: Record<string, string>;
  baseline: Baseline | null;
  alternatives: ScoredOption[];
  warnings?: string[];
  notes?: string[];
  excluded?: Array<{ crop_id: string; reason_code: string; explanation: string }>;
};

export type NoSuitableOptions = {
  status: "no_suitable_options";
  contract_version: string;
  engine_version: string;
  reason: string;
  blocked: Array<{ crop_id: string; reason_code: string; explanation: string }>;
  notes?: string[];
};

export type RequestError = {
  status: "request_error";
  contract_version: string;
  error: { code: string; fields: Array<{ path: string; code: string }> };
};

export type ModelUnavailable = {
  status: "model_unavailable";
  reason: string;
};

export type ScienceResponse =
  | ResultsAvailable
  | NoSuitableOptions
  | RequestError
  | ModelUnavailable;

/** Public (BFF) request body — mirrors the M2 form's native values (B0 §2 matrix). */
export type PublicRecommendationRequest = {
  parcel: {
    zone: "amir" | "moussa" | "other" | "unsure";
    areaHa?: string;
    irrigation: "drip-ui" | "surface-ui" | "other-ui" | "unsure" | "";
    location?: { lat: number; lon: number };
  };
  history: Array<{ crop_id: string; season?: string }>;
  plannedSeason?: string;
};

const SEASON_RE = /^\d{4}-\d{4}$/;

export function seasonGrammarOk(value: string): boolean {
  return SEASON_RE.test(value) && Number(value.slice(0, 4)) + 1 === Number(value.slice(5));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function evidenceOk(raw: unknown): raw is RuleEvidence[] {
  return Array.isArray(raw) && raw.every((e) =>
    isRecord(e) && typeof e.rule_id === "string" && typeof e.delta === "number"
    && typeof e.explanation === "string");
}

function scoredOptionOk(raw: unknown): raw is ScoredOption {
  if (!isRecord(raw)) return false;
  return typeof raw.crop_id === "string"
    && typeof raw.name_en === "string" && typeof raw.name_ar === "string"
    && typeof raw.score === "number" && raw.score >= 0 && raw.score <= 100
    && evidenceOk(raw.rule_evidence)
    && (raw.water_evidence === null
      || (isRecord(raw.water_evidence) && typeof raw.water_evidence.estimate_label === "string"))
    && Array.isArray(raw.notes);
}

/**
 * Runtime-validates an upstream science payload against the v0.2 union.
 * Returns a discriminated value or null (caller must treat null as upstream-invalid).
 */
export function validateScienceResponse(raw: unknown): ScienceResponse | null {
  if (!isRecord(raw) || typeof raw.status !== "string") return null;
  switch (raw.status) {
    case "results_available": {
      const alts = raw.alternatives;
      if (!Array.isArray(alts) || alts.length === 0 || !alts.every(scoredOptionOk)) return null;
      if (alts.length > 3) return null;
      const baseline = raw.baseline === null ? null : (scoredOptionOk(raw.baseline) ? raw.baseline : undefined);
      if (baseline === undefined) return null;
      if (raw.contract_version !== "0.2" || typeof raw.engine_version !== "string") return null;
      return raw as unknown as ResultsAvailable;
    }
    case "no_suitable_options":
      return isRecord(raw) && Array.isArray(raw.blocked)
        ? raw as unknown as NoSuitableOptions
        : null;
    case "request_error":
      return isRecord(raw) && isRecord(raw.error) && Array.isArray(raw.error.fields)
        ? raw as unknown as RequestError
        : null;
    case "model_unavailable":
      return typeof raw.reason === "string" ? raw as unknown as ModelUnavailable : null;
    default:
      return null;
  }
}
