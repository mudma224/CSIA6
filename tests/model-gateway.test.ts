/**
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { postRecommendation } from "@/lib/server/modelGateway";

const RESULTS_UNION = {
  status: "results_available",
  contract_version: "0.2",
  engine_version: "rule-engine 0.2.0",
  data_versions: { crops_vocabulary: "crops.v1" },
  baseline: {
    crop_id: "wheat", name_en: "Wheat", name_ar: "القمح", score: 88,
    rule_evidence: [{ rule_id: "R-BRK-01", delta: -12, explanation: "cereal after cereal",
      explanation_ary_pending_review: "x" }],
    water_evidence: null, notes: [],
  },
  alternatives: [{
    crop_id: "alfalfa", name_en: "Alfalfa", name_ar: "البرسيم الحجازي", score: 92, rank: 1,
    rule_evidence: [], water_evidence: {
      crop_water_need_mm_estimate: [800, 1600],
      estimate_source: "FAO", estimate_label: "estimate - not a measured or guaranteed value",
    }, notes: [],
  }],
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("model gateway transport", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.MODEL_API_BASE_URL = "http://127.0.0.1:8001";
    delete process.env.MODEL_API_TOKEN;
  });
  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("posts to the private route with no-store, no redirects, and validates the union", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(RESULTS_UNION));
    vi.stubGlobal("fetch", fetchMock);
    const result = await postRecommendation({ parcel: { zone: "beni_amir" } });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe("results_available");
    }
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("http://127.0.0.1:8001/internal/v1/recommendations");
    expect(init.method).toBe("POST");
    expect(init.cache).toBe("no-store");
    expect(init.redirect).toBe("error");
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
    expect("Authorization" in (init.headers as object)).toBe(false);
  });

  it("sends a bearer token only when configured", async () => {
    process.env.MODEL_API_TOKEN = "service-secret";
    const fetchMock = vi.fn(async () => jsonResponse(RESULTS_UNION));
    vi.stubGlobal("fetch", fetchMock);
    await postRecommendation({});
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer service-secret");
  });

  it("classifies aborts as timeout and other rejections as network", async () => {
    const abortError = new Error("aborted");
    abortError.name = "AbortError";
    vi.stubGlobal("fetch", vi.fn(async () => { throw abortError; }));
    const timeout = await postRecommendation({});
    expect(timeout).toEqual({ ok: false, failure: { kind: "timeout" } });

    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("ECONNREFUSED"); }));
    const network = await postRecommendation({});
    expect(network).toEqual({ ok: false, failure: { kind: "network" } });
  });

  it("maps upstream http errors and malformed bodies to honest failures", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ oops: true }, 500)));
    expect(await postRecommendation({})).toEqual({ ok: false, failure: { kind: "http_status", httpStatus: 500 } });

    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => { throw new Error("bad json"); } })));
    expect(await postRecommendation({})).toEqual({ ok: false, failure: { kind: "invalid_response" } });

    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ status: "made_up_status" })));
    expect(await postRecommendation({})).toEqual({ ok: false, failure: { kind: "invalid_response" } });
  });

  it("rejects non-loopback http base URLs before any call", async () => {
    process.env.MODEL_API_BASE_URL = "http://insecure.example.com";
    vi.stubGlobal("fetch", vi.fn());
    await expect(postRecommendation({})).rejects.toThrow(/HTTPS outside loopback/);
    expect(vi.mocked(globalThis.fetch).mock.calls.length).toBe(0);
  });
});
