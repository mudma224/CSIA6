if (typeof window !== "undefined") {
  throw new Error("This module is server-only and must never run in the browser.");
}

/**
 * Server-only transport to the private FastAPI science service
 * (docs/backend/06-MODEL-SERVICE-AND-GATEWAY.md §4).
 * Fixed allowlisted base URL from env, explicit timeout, no redirects,
 * no-store, bearer token optional. Never called from the browser.
 */
import { validateScienceResponse, type ScienceResponse } from "@/lib/recommendationTypes";

const DEFAULT_BASE_URL = "http://127.0.0.1:8001";
const DEFAULT_TIMEOUT_MS = 8000;
const LOOPBACK = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;

export type GatewayFailure = {
  kind: "timeout" | "network" | "http_status" | "invalid_response";
  httpStatus?: number;
};

export type GatewayResult =
  | { ok: true; value: ScienceResponse }
  | { ok: false; failure: GatewayFailure };

function baseUrl(): string {
  const raw = (process.env.MODEL_API_BASE_URL ?? DEFAULT_BASE_URL).trim();
  const url = new URL(raw);
  if (url.protocol === "http:" && !LOOPBACK.test(raw)) {
    throw new Error("MODEL_API_BASE_URL must use HTTPS outside loopback");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("MODEL_API_BASE_URL must be http(s)");
  }
  return raw.replace(/\/$/, "");
}

export async function postRecommendation(body: unknown): Promise<GatewayResult> {
  const timeoutMs = Number(process.env.MODEL_API_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const target = `${baseUrl()}/internal/v1/recommendations`; // URL validated BEFORE the guarded call
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = process.env.MODEL_API_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;
    response = await fetch(target, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
      redirect: "error",
    });
  } catch (error) {
    clearTimeout(timer);
    const aborted = error instanceof Error && error.name === "AbortError";
    return { ok: false, failure: aborted ? { kind: "timeout" } : { kind: "network" } };
  }
  clearTimeout(timer);
  if (!response.ok) {
    return { ok: false, failure: { kind: "http_status", httpStatus: response.status } };
  }
  let raw: unknown;
  try {
    raw = await response.json();
  } catch {
    return { ok: false, failure: { kind: "invalid_response" } };
  }
  const value = validateScienceResponse(raw);
  if (value === null) {
    return { ok: false, failure: { kind: "invalid_response" } };
  }
  return { ok: true, value };
}
