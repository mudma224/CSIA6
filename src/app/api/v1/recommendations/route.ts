if (typeof window !== "undefined") {
  throw new Error("This module is server-only and must never run in the browser.");
}

/**
 * Public BFF route — POST /api/v1/recommendations (B0 §3, B3 wiring after G0 approval).
 * Demo policy (decisions.md 2026-11-15): no auth provider yet (C02 pending), rate-limited,
 * nothing persisted, results are real rule-engine output. Logs carry no farmer inputs.
 */
import { NextResponse } from "next/server";

import { rateLimit } from "@/lib/server/rateLimit";
import { publicToScience } from "@/lib/server/modelAdapters";
import { postRecommendation } from "@/lib/server/modelGateway";
import {
  seasonGrammarOk,
  type PublicRecommendationRequest,
} from "@/lib/recommendationTypes";

export const dynamic = "force-dynamic";

const ZONES = ["amir", "moussa", "other", "unsure"] as const;
const IRRIGATIONS = ["drip-ui", "surface-ui", "other-ui", "unsure", ""] as const;

type FieldError = { path: string; code: string };

function fields(body: unknown): { ok: true; value: PublicRecommendationRequest }
  | { ok: false; errors: FieldError[] } {
  const errors: FieldError[] = [];
  if (typeof body !== "object" || body === null) {
    return { ok: false, errors: [{ path: "$", code: "INVALID_OBJECT" }] };
  }
  const raw = body as Record<string, unknown>;
  const parcel = raw.parcel as Record<string, unknown> | undefined;
  if (!parcel || typeof parcel !== "object") {
    return { ok: false, errors: [{ path: "parcel", code: "REQUIRED" }] };
  }
  if (!ZONES.includes(parcel.zone as (typeof ZONES)[number])) {
    errors.push({ path: "parcel.zone", code: "INVALID_ENUM" });
  }
  if (!IRRIGATIONS.includes(parcel.irrigation as (typeof IRRIGATIONS)[number])) {
    errors.push({ path: "parcel.irrigation", code: "INVALID_ENUM" });
  }
  const areaHa = typeof parcel.areaHa === "string" ? parcel.areaHa : undefined;
  const locationRaw = parcel.location as Record<string, unknown> | undefined;
  let location: { lat: number; lon: number } | undefined;
  if (locationRaw) {
    const lat = Number(locationRaw.lat);
    const lon = Number(locationRaw.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)
      || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      errors.push({ path: "parcel.location", code: "INVALID_COORDS" });
    } else {
      location = { lat, lon };
    }
  }
  const historyRaw = Array.isArray(raw.history) ? raw.history : [];
  if (historyRaw.length > 3) {
    errors.push({ path: "history", code: "INVALID_HISTORY" });
  }
  const history = [];
  for (const [i, entry] of historyRaw.entries()) {
    const e = entry as Record<string, unknown>;
    const crop = typeof e?.crop_id === "string" ? e.crop_id.trim().toLowerCase() : "";
    if (!crop) {
      errors.push({ path: `history[${i}].crop_id`, code: "REQUIRED" });
      continue;
    }
    const season = typeof e?.season === "string" ? e.season.trim() : "";
    if (season && !seasonGrammarOk(season)) {
      errors.push({ path: `history[${i}].season`, code: "INVALID_SEASON" });
    }
    history.push({ crop_id: crop, ...(season ? { season } : {}) });
  }
  const plannedSeason = typeof raw.plannedSeason === "string" ? raw.plannedSeason.trim() : "";
  if (plannedSeason && !seasonGrammarOk(plannedSeason)) {
    errors.push({ path: "plannedSeason", code: "INVALID_SEASON" });
  }
  if (errors.length) {
    return { ok: false, errors };
  }
  const value: PublicRecommendationRequest = {
    parcel: {
      zone: parcel.zone as PublicRecommendationRequest["parcel"]["zone"],
      irrigation: parcel.irrigation as PublicRecommendationRequest["parcel"]["irrigation"],
      ...(areaHa !== undefined ? { areaHa } : {}),
      ...(location ? { location } : {}),
    },
    history,
    ...(plannedSeason ? { plannedSeason } : {}),
  };
  return { ok: true, value };
}

function clientKey(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for") ?? "";
  return fwd.split(",")[0].trim() || "local";
}

export async function POST(request: Request): Promise<NextResponse> {
  const limit = rateLimit(clientKey(request));
  if (!limit.allowed) {
    return NextResponse.json(
      { status: "request_error", error: { code: "RATE_LIMITED", fields: [] } },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec), "Cache-Control": "no-store" } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: "request_error", error: { code: "INVALID_JSON", fields: [] } },
      { status: 422, headers: { "Cache-Control": "no-store" } },
    );
  }

  const parsed = fields(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { status: "request_error", error: { code: "VALIDATION_ERROR", fields: parsed.errors } },
      { status: 422, headers: { "Cache-Control": "no-store" } },
    );
  }

  const scienceRequest = publicToScience(parsed.value);
  // Science base URL resolution:
  //   1. explicit MODEL_API_BASE_URL (local uvicorn :8001 or external HTTPS host)
  //   2. on Vercel: the same deployment's /api/science Python function (same-origin, HTTPS)
  //   3. fallback: local loopback service (gateway default)
  const sameOrigin = process.env.VERCEL === "1"
    ? `${new URL(request.url).origin}/api/science`
    : undefined;
  const result = await postRecommendation(scienceRequest, {
    baseUrl: process.env.MODEL_API_BASE_URL ?? sameOrigin,
  });

  if (!result.ok) {
    const reasonByKind = {
      timeout: "timeout",
      network: "service_unreachable",
      invalid_response: "invalid_upstream_response",
      http_status: "service_error",
    } as const;
    const status = result.failure.kind === "timeout" ? 504 : 503;
    return NextResponse.json(
      { status: "model_unavailable", reason: reasonByKind[result.failure.kind] },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }

  const value = result.value;
  if (value.status === "request_error") {
    return NextResponse.json(value, { status: 422, headers: { "Cache-Control": "no-store" } });
  }
  if (value.status === "model_unavailable") {
    return NextResponse.json(value, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json(value, { status: 200, headers: { "Cache-Control": "no-store" } });
}
