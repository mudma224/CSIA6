/**
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { postRecommendation } = vi.hoisted(() => ({
  postRecommendation: vi.fn(),
}));

vi.mock("@/lib/server/modelGateway", () => ({ postRecommendation }));

import { POST } from "@/app/api/v1/recommendations/route";

const RESULTS_UNION = {
  status: "results_available",
  contract_version: "0.2",
  engine_version: "rule-engine 0.2.0",
  data_versions: { crops_vocabulary: "crops.v1" },
  baseline: {
    crop_id: "wheat", name_en: "Wheat", name_ar: "القمح", score: 88,
    rule_evidence: [{ rule_id: "R-BRK-01", delta: -12, explanation: "e",
      explanation_ary_pending_review: "x" }],
    water_evidence: null, notes: [],
  },
  alternatives: [{
    crop_id: "alfalfa", name_en: "Alfalfa", name_ar: "البرسيم الحجازي", score: 92, rank: 1,
    rule_evidence: [], water_evidence: null, notes: [],
  }],
};

function request(body: unknown): Request {
  return new Request("http://localhost:3000/api/v1/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  parcel: { zone: "amir", areaHa: "2,5", irrigation: "drip-ui" },
  history: [{ crop_id: "wheat", season: "2024-2025" }],
  plannedSeason: "2025-2026",
};

beforeEach(() => {
  postRecommendation.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/v1/recommendations (BFF)", () => {
  it("maps the public form payload to the science contract and returns 200", async () => {
    postRecommendation.mockResolvedValue({ ok: true, value: RESULTS_UNION });
    const res = await POST(request(VALID_BODY));
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const body = await res.json();
    expect(body.status).toBe("results_available");
    const scienceBody = postRecommendation.mock.calls[0][0];
    expect(scienceBody.parcel.zone).toBe("beni_amir");
    expect(scienceBody.parcel.irrigation).toBe("drip");
    expect(scienceBody.parcel.area_ha).toBe(2.5);
    expect(scienceBody.history[0]).toEqual({ crop_id: "wheat", season: "2024-2025" });
    expect(scienceBody.planned_season).toBe("2025-2026");
    // no same-origin override outside Vercel; gateway falls back to the loopback default
    expect(postRecommendation.mock.calls[0][1].baseUrl).toBeUndefined();
  });

  it("on Vercel, resolves the science function at the deployment's own origin", async () => {
    process.env.VERCEL = "1";
    try {
      postRecommendation.mockResolvedValue({ ok: true, value: RESULTS_UNION });
      const res = await POST(request(VALID_BODY));
      expect(res.status).toBe(200);
      const opts = postRecommendation.mock.calls[0][1];
      expect(opts.baseUrl).toBe("http://localhost:3000/api/science");
    } finally {
      delete process.env.VERCEL;
    }
  });

  it("maps surface irrigation to unknown without inventing flood/basin (C04)", async () => {
    postRecommendation.mockResolvedValue({ ok: true, value: RESULTS_UNION });
    const body = { parcel: { zone: "unsure", irrigation: "surface-ui" }, history: [] };
    const res = await POST(request(body));
    expect(res.status).toBe(200);
    const scienceBody = postRecommendation.mock.calls[0][0];
    expect(scienceBody.parcel.irrigation).toBe("unknown");
    expect(scienceBody.parcel.zone).toBe("unsure");
    expect(scienceBody.history).toEqual([]);
    expect(scienceBody.planned_season).toBeUndefined();
  });

  it("returns field-coded 422 for invalid enums or seasons", async () => {
    const res = await POST(request({ parcel: { zone: "galaxy", irrigation: "drip-ui" } }));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.status).toBe("request_error");
    expect(body.error.fields.some((f: { path: string }) => f.path === "parcel.zone")).toBe(true);
  });

  it("passes the science request_error union through as 422", async () => {
    postRecommendation.mockResolvedValue({
      ok: true,
      value: {
        status: "request_error", contract_version: "0.2",
        error: { code: "VALIDATION_ERROR",
          fields: [{ path: "history[0].crop_id", code: "UNRECOGNIZED_CROP" }] },
      },
    });
    const res = await POST(request(VALID_BODY));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.fields[0].code).toBe("UNRECOGNIZED_CROP");
  });

  it("maps transport failures to honest unavailable statuses", async () => {
    postRecommendation.mockResolvedValue({ ok: false, failure: { kind: "timeout" } });
    expect((await POST(request(VALID_BODY))).status).toBe(504);

    postRecommendation.mockResolvedValue({ ok: false, failure: { kind: "network" } });
    const net = await POST(request(VALID_BODY));
    expect(net.status).toBe(503);
    expect((await net.json()).reason).toBe("service_unreachable");

    postRecommendation.mockResolvedValue({ ok: false, failure: { kind: "invalid_response" } });
    const invalid = await POST(request(VALID_BODY));
    expect(invalid.status).toBe(503);
    expect((await invalid.json()).reason).toBe("invalid_upstream_response");
  });

  it("rejects malformed JSON with the contract envelope", async () => {
    const res = await POST(new Request("http://localhost:3000/api/v1/recommendations", {
      method: "POST", body: "{not json", headers: { "Content-Type": "application/json" },
    }));
    expect(res.status).toBe(422);
    expect((await res.json()).error.code).toBe("INVALID_JSON");
  });

  it("rate limits repeated requests from the same client", async () => {
    postRecommendation.mockResolvedValue({ ok: true, value: RESULTS_UNION });
    let last = 200;
    for (let i = 0; i < 40; i += 1) {
      last = (await POST(request(VALID_BODY))).status;
    }
    expect(last).toBe(429);
  });
});
