import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { RotationScreen } from "@/features/m2/RotationScreen";

const RESULTS = {
  status: "results_available",
  contract_version: "0.2",
  engine_version: "rule-engine 0.2.0",
  data_versions: { crops_vocabulary: "crops.v1" },
  baseline: {
    crop_id: "wheat", name_en: "Wheat", name_ar: "القمح", score: 88,
    rule_evidence: [{ rule_id: "R-BRK-01", delta: -12,
      explanation: "cereal after cereal: disease carry-over risk",
      explanation_ary_pending_review: "القمح بعد القمح" }],
    water_evidence: null,
    notes: ["baseline = repeating last season's crop"],
  },
  alternatives: [
    {
      crop_id: "alfalfa", name_en: "Alfalfa", name_ar: "البرسيم الحجازي", score: 92, rank: 1,
      rule_evidence: [{ rule_id: "R-LEG-01", delta: 15,
        explanation: "legume predecessor supplies a nitrogen credit",
        explanation_ary_pending_review: "المزروع البقولي كيعطي أزوت" }],
      water_evidence: { crop_water_need_mm_estimate: [800, 1600],
        estimate_source: "FAO", estimate_label: "estimate" },
      notes: ["water_high_need_surface_irrigation_caution"],
    },
    {
      crop_id: "sugar_beet", name_en: "Sugar beet", name_ar: "بنجر السكر", score: 100, rank: 2,
      rule_evidence: [], water_evidence: null, notes: [],
    },
    {
      crop_id: "maize", name_en: "Maize", name_ar: "الذرة الصفراء", score: 88, rank: 3,
      rule_evidence: [], water_evidence: null, notes: [],
    },
  ],
  warnings: ["season_absent_results_generic", "priorities_not_provided_neutral_weights"],
};

function setStorage(payload: unknown) {
  sessionStorage.setItem("fb.recommendations.v1", JSON.stringify(payload));
}

beforeEach(() => {
  sessionStorage.clear();
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
});

describe("rotation results screen", () => {
  it("shows the honest intro when nothing was requested yet", () => {
    render(<LocaleProvider><RotationScreen /></LocaleProvider>);
    expect(screen.getByRole("heading", { name: "Crop recommendations" })).toBeInTheDocument();
    expect(screen.getAllByText(/Describe a parcel/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Ranking score/)).not.toBeInTheDocument();
  });

  it("renders baseline, two alternatives max, evidence and water estimate label", async () => {
    setStorage(RESULTS);
    render(<LocaleProvider><RotationScreen /></LocaleProvider>);
    await waitFor(() => expect(screen.getByText(/Your current strategy/)).toBeInTheDocument());
    expect(screen.getByText("Wheat")).toBeInTheDocument();
    expect(screen.getByText("Alfalfa")).toBeInTheDocument();
    expect(screen.getByText("Sugar beet")).toBeInTheDocument();
    expect(screen.queryByText("Maize")).not.toBeInTheDocument(); // UI cap = 2 alternatives
    expect(screen.getByText(/Only the top 2 alternatives/)).toBeInTheDocument();
    expect(screen.getAllByText(/R-LEG-01/).length).toBeGreaterThan(0);
    expect(screen.getByText(/800–1600 mm/)).toBeInTheDocument();
    expect(screen.getAllByText(/estimate — not a measured or guaranteed value/).length).toBeGreaterThan(0);
    expect(screen.getByText(/No planned season was provided/)).toBeInTheDocument();
    expect(screen.getByText(/No priorities were provided/)).toBeInTheDocument();
  });

  it("renders the request_error union with field codes, no invented result", async () => {
    setStorage({
      status: "request_error", contract_version: "0.2",
      error: { code: "VALIDATION_ERROR", fields: [{ path: "history[0].crop_id", code: "UNRECOGNIZED_CROP" }] },
    });
    render(<LocaleProvider><RotationScreen /></LocaleProvider>);
    await waitFor(() => expect(screen.getByText(/needs review/)).toBeInTheDocument());
    expect(screen.getByText(/history\[0\]\.crop_id/)).toBeInTheDocument();
    expect(screen.getByText(/UNRECOGNIZED_CROP/)).toBeInTheDocument();
    expect(screen.queryByText(/Ranking score/)).not.toBeInTheDocument();
  });

  it("renders no_suitable_options with blocking reasons", async () => {
    setStorage({
      status: "no_suitable_options", contract_version: "0.2",
      engine_version: "rule-engine 0.2.0", reason: "every_rotation_candidate_blocked",
      blocked: [{ crop_id: "sugar_beet", reason_code: "R-BEET-01_blocking",
        explanation: "beet cyst nematode - 3-5 year break required" }],
    });
    render(<LocaleProvider><RotationScreen /></LocaleProvider>);
    await waitFor(() => expect(screen.getByText(/No suitable option right now/)).toBeInTheDocument());
    expect(screen.getByText(/R-BEET-01_blocking/)).toBeInTheDocument();
    expect(screen.queryByText(/Ranking score/)).not.toBeInTheDocument();
  });

  it("renders the honest unavailable state and never invents results", async () => {
    setStorage({ status: "model_unavailable", reason: "service_unreachable" });
    render(<LocaleProvider><RotationScreen /></LocaleProvider>);
    await waitFor(() => expect(screen.getByText(/Scoring service unavailable/)).toBeInTheDocument());
    expect(screen.getByText(/Nothing was invented/)).toBeInTheDocument();
    expect(screen.queryByText(/Ranking score/)).not.toBeInTheDocument();
  });

  it("falls back to the intro on malformed storage content", async () => {
    sessionStorage.setItem("fb.recommendations.v1", "{not json");
    render(<LocaleProvider><RotationScreen /></LocaleProvider>);
    await waitFor(() => expect(screen.getAllByText(/Describe a parcel/).length).toBeGreaterThan(0));
    expect(screen.queryByText(/Ranking score/)).not.toBeInTheDocument();
  });
});
